/* eslint-disable no-process-env */
import { loadEnv, normalizePort } from './config.util'

const NODE_ENV = process.env.NODE_ENV || 'development'
const IS_PROD = NODE_ENV === 'production'

const env = loadEnv(NODE_ENV)

const config = {
  NODE_ENV,
  IS_PROD,
  PORT: normalizePort(),
  MONGODB_URI: env.MONGODB_URI,
}

export default config
