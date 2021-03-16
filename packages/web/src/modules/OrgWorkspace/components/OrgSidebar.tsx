import { FC } from 'react'

import { Book, Nut, Users } from 'phosphor-react'
import { matchPath } from 'react-router-dom'

import { SidebarMenu } from '@kathena/ui'
import { USER_LIST } from 'utils/path-builder'

export type OrgSidebarProps = {}

const OrgSidebar: FC<OrgSidebarProps> = () => (
  <SidebarMenu
    menus={[
      {
        key: 'users',
        title: 'QL người dùng',
        icon: Users,
        items: [
          {
            key: 'users',
            label: 'Người dùng',
            link: USER_LIST,
            active: !!matchPath(window.location.pathname, {
              path: USER_LIST,
              exact: false,
              strict: false,
            }),
          },
        ],
      },
      {
        key: 'courses',
        title: 'QL khoá học',
        icon: Book,
        items: [
          { key: 'users', label: 'Người dùng' },
          { key: 'courses', label: 'Khoá học' },
        ],
      },
      {
        key: 'settings',
        title: 'QL hệ thống',
        icon: Nut,
        items: [
          { key: 'users', label: 'Người dùng' },
          { key: 'courses', label: 'Khoá học' },
        ],
      },
    ]}
  />
)

export default OrgSidebar
