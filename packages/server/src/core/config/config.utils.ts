/* eslint-disable no-process-env */
import { Logger } from 'core/Logger'
import * as dotenv from 'dotenv'

export const loadEnv = (nodeEnv = 'development') => {
  const logger = new Logger('config:loadEnv')

  let env = {}

  logger.log(`Loading env for ${nodeEnv}`)

  const envFiles = [
    `.env.${nodeEnv}.local`,
    `.env.${nodeEnv}`,
    '.env.local',
    '.env',
  ]

  envFiles.forEach((file) => {
    env = {
      ...dotenv.config({ path: file }).parsed,
      ...env,
    }
  })

  logger.log(`Loaded environment variables`)
  logger.log(env)

  return process.env
}

export const normalizePort = () => {
  const DEFAULT_PORT = 4000
  const port = +(process.env.PORT ?? DEFAULT_PORT)

  if (Number.isNaN(port)) {
    return DEFAULT_PORT
  }
  return port
}
