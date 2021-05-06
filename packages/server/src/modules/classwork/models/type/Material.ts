import { ObjectType } from '@nestjs/graphql'

import { Classwork } from '../Classwork'

@ObjectType({ implements: [Classwork] })
export class Material extends Classwork {}
