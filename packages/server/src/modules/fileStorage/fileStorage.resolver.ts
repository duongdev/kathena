import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql'

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
    const { name } = file

    return `http://${config.APP_DOMAIN}/files/${name}`
  }
}
