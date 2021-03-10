import { MongoMemoryServer } from 'mongodb-memory-server'
import * as mongoose from 'mongoose'

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
