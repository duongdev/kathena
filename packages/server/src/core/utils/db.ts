import { Types, isValidObjectId } from 'mongoose'

import { ANY } from 'types'

export const objectId = (): string => Types.ObjectId().toHexString()
export const isObjectId = (value: ANY): boolean => isValidObjectId(value)
