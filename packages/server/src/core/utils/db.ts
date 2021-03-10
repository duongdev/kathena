import { Types } from 'mongoose'

export const objectId = (): string => Types.ObjectId().toHexString()
