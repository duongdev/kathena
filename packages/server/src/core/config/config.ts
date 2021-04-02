/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-process-env */
import { resolve } from 'path'

import { loadEnv, normalizePort } from './config.util'

const NODE_ENV = process.env.NODE_ENV || 'development'
const IS_PROD = NODE_ENV === 'production'

const env = loadEnv(NODE_ENV) as { [k: string]: string }

// TODO: Validate environment variables

const config = {
  NODE_ENV,
  IS_PROD,
  PORT: normalizePort(),
  MONGODB_URI: env.MONGODB_URI,
  JWT_SECRET: env.JWT_SECRET,
  INIT_ADMIN_PWD: env.INIT_ADMIN_PWD,
  FILE_STORAGE_UPLOADS_DIR: resolve(
    __dirname,
    '../../..',
    env.FILE_STORAGE_UPLOADS_DIR,
  ),
  ENABLE_DEVTOOL_MODULE: env.ENABLE_DEVTOOL_MODULE === 'true',
}

export default config
