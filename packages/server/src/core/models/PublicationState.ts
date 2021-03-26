import { registerEnumType } from '@nestjs/graphql'

export enum Publication {
  Draft = 'Draft',
  Published = 'Published',
}

registerEnumType(Publication, { name: 'Publication' })
