import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

import { Permission } from 'modules/auth/models/Permission'

import { AuthGuard } from './auth.guard'
import { PermissionGuard, PERMISSION_KEY } from './permission.guard'

export const CurrentAccount = createParamDecorator(
  (_, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().account,
)

export const CurrentOrg = createParamDecorator(
  (_, ctx: ExecutionContext) =>
    GqlExecutionContext.create(ctx).getContext().org,
)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const UseAuthGuard = (permission?: Permission) =>
  applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
    UseGuards(AuthGuard, PermissionGuard),
  )

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const UsePermissionGuard = () => UseGuards(PermissionGuard)
