import { NestFactory } from '@nestjs/core'
import * as bodyParser from 'body-parser'

import { config } from 'core'
import { AppModule } from 'core/app'
import { Logger } from 'core/Logger'

const logger = new Logger('bootstrap')

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const port = config.PORT

  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
  app.enableCors()

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Application is running on http://0.0.0.0:${port}`)
  })
}

export default bootstrap
