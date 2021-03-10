import { Logger } from '@nestjs/common'
import * as dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server'

// eslint-disable-next-line no-process-env
const NODE_ENV = process.env.NODE_ENV || 'development'

const fileList = [
  `.env.${NODE_ENV}.local`,
  `.env.${NODE_ENV}`,
  '.env.local',
  '.env',
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
module.exports = async () => {
  fileList.forEach((file) => {
    dotenv.config({ path: file })
  })

  const logger = new Logger('globalSetup')
  const mongoServer = new MongoMemoryServer()
  await mongoServer.getUri()

  await mongoServer.stop()
  logger.log('Initialized MongoDB Memory Server successfully.')
}
