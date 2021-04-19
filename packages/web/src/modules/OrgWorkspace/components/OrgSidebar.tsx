import { FC } from 'react'

import { Book, Nut, Users } from 'phosphor-react'
import { matchPath } from 'react-router-dom'

import { SidebarMenu } from '@kathena/ui'
import {
  ACADEMIC_SUBJECT_LIST,
  ORG_SETTINGS,
  USER_LIST,
  ACADEMIC_COURSE_LIST,
} from 'utils/path-builder'

export type OrgSidebarProps = {}

const OrgSidebar: FC<OrgSidebarProps> = () => (
  <SidebarMenu
    menus={[
      {
        key: 'users',
        title: 'Người dùng',
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
        key: 'academicSubject',
        title: 'Học vụ',
        icon: Book,
        items: [
          {
            key: 'academicSubjectList',
            label: 'Môn học',
            link: ACADEMIC_SUBJECT_LIST,
            active: !!matchPath(window.location.pathname, {
              path: ACADEMIC_SUBJECT_LIST,
              exact: false,
              strict: false,
            }),
          },
          {
            key: 'courses',
            label: 'Khoá học',
            link: ACADEMIC_COURSE_LIST,
            active: !!matchPath(window.location.pathname, {
              path: ACADEMIC_COURSE_LIST,
              exact: false,
              strict: false,
            }),
          },
        ],
      },
      {
        key: 'settings',
        title: 'Hệ thống',
        icon: Nut,
        items: [
          {
            key: 'org-settings',
            label: 'Cài đặt tổ chức',
            link: ORG_SETTINGS,
            active: !!matchPath(window.location.pathname, {
              path: ORG_SETTINGS,
              exact: false,
              strict: false,
            }),
          },
        ],
      },
    ]}
  />
)

export default OrgSidebar
