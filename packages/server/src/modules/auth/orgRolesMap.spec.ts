import { orgRoles } from './orgRolesMap'

describe('orgRolesMap', () => {
  it(`should match snapshot`, () => {
    expect(orgRoles).toMatchSnapshot()
  })
})
