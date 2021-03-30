import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

import { BaseModel } from 'core'

export enum FileStorageProvider {
  LocalStorage = 'LocalStorage',
  // AwsS3 = 'AwsS3', not supported yet
}

registerEnumType(FileStorageProvider, { name: 'FileLocation' })

@ObjectType({ implements: [BaseModel] })
export class File extends BaseModel {
  @Field()
  @prop({ required: true, index: true })
  name: string

  @Field((_type) => Int)
  @prop({ required: true })
  size: number

  @Field()
  @prop({ required: true, index: true })
  mimeType: string

  @Field((_type) => FileStorageProvider)
  @prop({ type: String, enum: FileStorageProvider })
  storageProvider: FileStorageProvider

  @Field()
  @prop({ index: true })
  storageProviderIdentifier: string

  @prop({ type: Types.ObjectId, index: true })
  createdByAccountId: string
}
