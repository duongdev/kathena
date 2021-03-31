import { Scalar } from '@nestjs/graphql'
import * as FileType from 'file-type'
import { GraphQLError } from 'graphql'
import { FileUpload } from 'graphql-upload'
import { isUndefined } from 'lodash'

@Scalar('GraphQLUpload')
export class GraphQLUpload {
  description = 'File upload scalar type'

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async parseValue(value: Promise<FileUpload>) {
    const upload = await value
    const stream = upload.createReadStream()
    const fileType = await FileType.fromStream(stream)

    if (isUndefined(fileType)) throw new GraphQLError('Mime type is unknown.')

    return { ...upload, mimetype: fileType.mime }
  }
}
