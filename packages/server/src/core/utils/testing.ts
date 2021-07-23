import { LoggerService, ModuleMetadata } from '@nestjs/common'
// eslint-disable-next-line import/no-extraneous-dependencies
import { Test, TestingModule } from '@nestjs/testing'
import { MongoMemoryServer } from 'mongodb-memory-server'
import * as mongoose from 'mongoose'
import { TypegooseModule } from 'nestjs-typegoose'

import { appModules } from 'core/app'
import { ANY } from 'types'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const initTestDb = async () => {
  const mongod = new MongoMemoryServer()
  const uri = await mongod.getUri()

  const mongooseConnection = mongoose.createConnection(uri, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
  })

  return { uri, mongooseConnection }
}

class EmptyLogger implements LoggerService {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  log(message: string): ANY {}

  error(message: string, trace: string): ANY {}

  warn(message: string): ANY {}

  debug(message: string): ANY {}

  verbose(message: string): ANY {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export const createTestingModule = async (
  mongoUri: string,
  metadata?: ModuleMetadata,
  options: { disableLogger: boolean } = { disableLogger: true },
): Promise<TestingModule> => {
  const module = await Test.createTestingModule({
    imports: [
      ...(metadata?.imports ?? []),
      TypegooseModule.forRoot(mongoUri, {
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true,
      }),
      ...appModules,
    ],
  }).compile()

  if (options.disableLogger) module.useLogger(new EmptyLogger())

  return module
}
