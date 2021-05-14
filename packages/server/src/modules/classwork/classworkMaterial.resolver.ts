import { forwardRef, Inject } from '@nestjs/common'
import { Resolver } from '@nestjs/graphql'

import { AuthService } from 'modules/auth/auth.service'

import { ClassworkService } from './classwork.service'
import { Classwork } from './models/Classwork'

@Resolver((_of) => Classwork)
export class ClassworkMaterialResolver {
  constructor(
    private readonly classworkService: ClassworkService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   *START MATERIAL RESOLVER
   */

  /**
   * END MATERIAL RESOLVER
   */
}
