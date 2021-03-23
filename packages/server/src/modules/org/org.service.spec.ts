// import { TestingModule } from '@nestjs/testing'
// import { createTestingModule, initTestDb } from 'core/utils/testing'
// import { Connection } from 'mongoose'
// import { OrgService } from './org.service'

// describe('org.service', () => {
//   let module: TestingModule
//   let orgService: OrgService
//   let mongooseConnection: Connection

//   beforeAll(async () => {
//     const testDb = await initTestDb()
//     mongooseConnection = testDb.mongooseConnection

//     module = await createTestingModule(testDb.uri)

//     orgService = module.get<OrgService>(OrgService)
//   })

//   afterAll(async () => {
//     await module.close()
//   })

//   beforeEach(async () => {
//     await module.close()
//   })

//   beforeEach(async () => {
//     await mongooseConnection.dropDatabase()
//     jest.resetAllMocks()
//     jest.restoreAllMocks()
//   })

//   it('should be defined', () => {
//     expect(orgService).toBeDefined()
//   })

//   describe('existsOrgByNamespace', () => {
//     it('return true if exist org by namespace', async () => {
//       expect.assertions(1)

//       jest
//         .spyOn(orgService['orgModel'], 'exists')
//         .mockRejectedValueOnce(true as never)

//       await expect(orgService.existsOrgByNamespace('teststring')).toBe(true)
//     })

//     it(`return false if don't exist org by namespace`, async () => {
//       expect.assertions(1)

//       jest
//         .spyOn(orgService['orgModel'], 'exists')
//         .mockRejectedValueOnce(false as never)

//       await expect(orgService.existsOrgByNamespace('teststring')).toBe(false)
//     })
//   })
// })
