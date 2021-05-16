import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  ReadStream,
  Stats,
  stat,
  statSync,
  unlink,
  unlinkSync,
  writeFileSync,
} from 'fs'
import * as path from 'path'

import { DocumentType, ReturnModelType } from '@typegoose/typegoose'
import * as fileType from 'file-type'
import * as shortid from 'shortid'

import { config, InjectModel, Logger, Service } from 'core'
import { ANY, Nullable } from 'types'

import { File, FileStorageProvider } from './models/File'

@Service()
export class FileStorageService {
  logger = new Logger(FileStorageService.name)

  constructor(
    @InjectModel(File)
    private readonly fileModel: ReturnModelType<typeof File>,
  ) {}

  async ensuresUploadsDirectory(
    dirPath = config.FILE_STORAGE_UPLOADS_DIR,
  ): Promise<void> {
    const isExisting = existsSync(dirPath)
    if (isExisting) return

    mkdirSync(config.FILE_STORAGE_UPLOADS_DIR)
  }

  generateShortId = (): string => {
    return shortid.generate()
  }

  async convertReadStreamToFileData(
    fileName: string,
    readStream: ReadStream,
  ): Promise<{
    buffer: Buffer
    stats: Stats
    extension: string
    mimeType: string
  }> {
    await this.ensuresUploadsDirectory()

    const filePath = path.resolve(
      config.FILE_STORAGE_UPLOADS_DIR,
      // '.tmp',
      `${this.generateShortId()}-${fileName}`,
    )

    // console.log('filePath', filePath)

    // await new Promise((resolve, reject) => {
    //   const writeStream = createWriteStream(filePath)
    //   const stream = readStream
    //     .pipe(writeStream)
    //     .on('finish', () => {
    //       console.log('finished')
    //       setTimeout(() => stream, 1000) // Below 70, the problem still occurred.
    //       resolve(filePath)
    //     })
    //     .on('error', (error) => {
    //       console.log('error', error)
    //       reject(error)
    //     })
    // })

    await new Promise((resolve, reject) => {
      const writeStream = createWriteStream(filePath, {
        encoding: 'base64' as ANY,
      })

      writeStream.on('finish', resolve)

      writeStream.on('error', (error) => {
        this.logger.error('writeStream error')
        this.logger.verbose(error)

        unlink(filePath, () => {
          reject(error)
        })
      })

      readStream.on('error', (error) => writeStream.destroy(error))

      readStream.pipe(writeStream)
    })

    const stats = statSync(filePath)
    const buffer = readFileSync(filePath)

    const { ext: extension = '', mime: mimeType = 'unknown' } =
      (await fileType.fromFile(filePath)) ?? {}

    unlinkSync(filePath)

    return {
      buffer,
      stats,
      extension,
      mimeType,
    }
  }

  async uploadToLocalStorage({
    buffer,
    fileName,
  }: {
    buffer: Buffer
    fileName: string
  }): Promise<{ filePath: string }> {
    const filePath = path.resolve(config.FILE_STORAGE_UPLOADS_DIR, fileName)

    writeFileSync(filePath, buffer)

    return { filePath }
  }

  async uploadFromReadStream({
    readStream,
    originalFileName,
    orgId,
    uploadedByAccountId,
  }: {
    readStream: ReadStream
    originalFileName: string
    orgId: string
    uploadedByAccountId: string
  }): Promise<DocumentType<File>> {
    const {
      stats,
      buffer,
      extension,
      mimeType,
    } = await this.convertReadStreamToFileData(originalFileName, readStream)

    const fileName = originalFileName.includes(extension)
      ? originalFileName
      : `${originalFileName}.${extension}`

    const { filePath } = await this.uploadToLocalStorage({
      buffer,
      fileName,
    })

    return this.fileModel.create({
      mimeType,
      orgId,
      size: stats.size,
      name: originalFileName,
      createdByAccountId: uploadedByAccountId,
      storageProvider: FileStorageProvider.LocalStorage,
      storageProviderIdentifier: filePath,
    })
  }

  async findFileById(fileId: string): Promise<Nullable<DocumentType<File>>> {
    return this.fileModel.findById(fileId)
  }

  async updateFile(
    fileId: string,
    newFile: {
      readStream
      originalFileName
    },
  ): Promise<DocumentType<File>> {
    const { readStream, originalFileName } = newFile
    const file = await this.findFileById(fileId)

    if (!file) {
      throw new Error(`Couldn't find file to update`)
    }
    stat(file.storageProviderIdentifier, (err, stats) => {
      if (stats) {
        unlink(file.storageProviderIdentifier, (error) => {
          return error
        })
      }
    })

    const {
      stats,
      buffer,
      extension,
      mimeType,
    } = await this.convertReadStreamToFileData(originalFileName, readStream)

    const fileName = originalFileName.includes(extension)
      ? originalFileName
      : `${originalFileName}.${extension}`

    const { filePath } = await this.uploadToLocalStorage({
      buffer,
      fileName,
    })

    file.mimeType = mimeType
    file.size = stats.size
    file.name = originalFileName
    file.storageProviderIdentifier = filePath

    const updatedFile = file.save()
    return updatedFile
  }
}
