import {
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { AuthGuard } from './auth.guard'

export const CurrentAccount = createParamDecorator(
  (_, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().account,
)

export const CurrentOrg = createParamDecorator(
  (_, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().org,
)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const UseAuthGuard = () => UseGuards(AuthGuard)
