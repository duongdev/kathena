module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './src',
  testEnvironment: 'node',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globalSetup: './tests/globalSetup.ts',
  moduleDirectories: ['node_modules', 'src'],
  collectCoverageFrom: ['**/*.service.ts'],
}
