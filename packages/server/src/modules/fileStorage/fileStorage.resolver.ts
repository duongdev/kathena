import { UsePipes, ValidationPipe } from '@nestjs/common'
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'
import { FileUpload, GraphQLUpload } from 'graphql-upload'

import { config } from 'core'
import { UseAuthGuard } from 'core/auth'
import { Nullable } from 'types'

import { FileStorageService } from './fileStorage.service'
import { File } from './models/File'

@Resolver((_of) => File)
export class FileStorageResolver {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Query((_returns) => File, { nullable: true })
  @UseAuthGuard()
  async file(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Nullable<File>> {
    return this.fileStorageService.findFileById(id)
  }

  @ResolveField((_returns) => String, { nullable: true })
  async signedUrl(@Parent() file: File): Promise<Nullable<string>> {
    const { codeName } = file

    return encodeURI(`http://${config.APP_DOMAIN}/files/${codeName}`)
  }

  @Mutation((_returns) => File)
  @UseAuthGuard()
  @UsePipes(ValidationPipe)
  async updateFile(
    @Args('id', { type: () => ID }) id: string,
    @Args('newFile', { type: () => GraphQLUpload }) newFile: FileUpload,
  ): Promise<Nullable<File>> {
    const { createReadStream, filename, encoding } = newFile

    // eslint-disable-next-line no-console
    console.log('encoding', encoding)

    return this.fileStorageService.updateFile(id, {
      readStream: createReadStream(),
      originalFileName: filename,
    })
  }
}
