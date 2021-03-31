import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { FileStorageService } from './fileStorage.service'
import { File } from './models/File'

@Module({
  imports: [TypegooseModule.forFeature([File])],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
