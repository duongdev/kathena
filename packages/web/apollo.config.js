/* eslint-disable */

const path = require('path')

const localSchemaFile = path.resolve(__dirname, '../server/schema.gql')

module.exports = {
  client: {
    service: {
      name: '@kathena/web',
      localSchemaFile: localSchemaFile,
      excludes: ['**/graphql/**/*'],
    },
  },
}
