import { NestFactory } from '@nestjs/core'
import { Logger } from 'core/Logger'
import { AppModule } from 'core/app'
import { config } from 'core'

const logger = new Logger('bootstrap')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = config.PORT

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Application is running on http://0.0.0.0:${port}`)
  })
}

export default bootstrap
