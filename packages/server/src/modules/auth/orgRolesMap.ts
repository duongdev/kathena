import { Permission as P } from './models/Permission'
import { Role } from './models/Role'

export const staff: Role = {
  name: 'staff',
  permissions: [P.Hr_Access, P.Hr_CreateAccount],
}

export const student: Role = {
  name: 'student',
  permissions: [],
}

export const lecturer: Role = {
  name: 'lecturer',
  permissions: [],
}

export const admin: Role = {
  name: 'admin',
  permissions: [...staff.permissions],
}

export const owner: Role = {
  name: 'owner',
  permissions: [...admin.permissions],
}

export const orgRoles = [owner, admin, staff, lecturer, student]
