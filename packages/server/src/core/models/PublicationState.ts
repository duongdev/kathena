import { registerEnumType } from '@nestjs/graphql'

export enum PublicationState {
  Draft = 'Draft',
  Published = 'Published',
}

registerEnumType(PublicationState, { name: 'PublicationState' })
