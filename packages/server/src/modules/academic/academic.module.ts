import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'

import { FileStorageModule } from 'modules/fileStorage/fileStorage.module'
import { OrgModule } from 'modules/org/org.module'

import { AcademicService } from './academic.service'
import { AcademicSubjectResolver } from './academicSubject.resolver'
import { AcademicSubject } from './models/AcademicSubject'

@Module({
  imports: [
    TypegooseModule.forFeature([AcademicSubject]),
    OrgModule,
    FileStorageModule,
  ],
  providers: [AcademicSubjectResolver, AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}
