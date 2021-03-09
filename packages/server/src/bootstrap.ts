import { NestFactory } from '@nestjs/core'

import { config } from 'core'
import { AppModule } from 'core/app'
import { Logger } from 'core/Logger'

const logger = new Logger('bootstrap')

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)
  const port = config.PORT

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Application is running on http://0.0.0.0:${port}`)
  })
}

export default bootstrap
