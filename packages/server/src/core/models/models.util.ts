import { Inject } from '@nestjs/common'
import { Types } from 'mongoose'
import { getModelToken as getTypegooseModelToken } from 'nestjs-typegoose'
import { TypegooseClass } from 'nestjs-typegoose/dist/typegoose-class.interface'

import { OBJECT } from 'types'

export const getModelToken = (model: string): string =>
  `${getTypegooseModelToken(model)}`

export const InjectModel = (
  typegooseClass: TypegooseClass,
): ((target: OBJECT, key: string | symbol, index?: number) => void) =>
  Inject(getModelToken(typegooseClass.name))

export const toObjectId = (id: string): Types.ObjectId => Types.ObjectId(id)
