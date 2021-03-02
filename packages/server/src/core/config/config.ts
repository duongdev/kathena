/* eslint-disable no-process-env */
import { loadEnv, normalizePort } from './config.utils'

const nodeEnv = process.env.NODE_ENV || 'development'

const env = loadEnv(nodeEnv)

const config = {
  nodeEnv,
  PORT: normalizePort(),
  MONGODB_URI: env.MONGODB_URI,
}

export default config
