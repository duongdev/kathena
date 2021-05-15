import { FC } from 'react'

import { Book, Nut, Users, BookOpen, GraduationCap } from 'phosphor-react'
import { matchPath } from 'react-router-dom'

import { SidebarMenu } from '@kathena/ui'
import { useAuth } from 'common/auth'
import { Permission } from 'graphql/generated'
import {
  ACADEMIC_COURSE_LIST,
  ACADEMIC_SUBJECT_LIST,
  ORG_SETTINGS,
  STUDYING_COURSE_LIST,
  TEACHING_COURSE_LIST,
  USER_LIST,
} from 'utils/path-builder'

export type OrgSidebarProps = {}

const OrgSidebar: FC<OrgSidebarProps> = () => {
  const { permissions } = useAuth()
  return (
    <SidebarMenu
      menus={[
        {
          key: 'users',
          title: 'Người dùng',
          icon: Users,
          hidden: !permissions.includes(Permission.Hr_Access),
          items: [
            {
              key: 'users',
              label: 'Người dùng',
              link: USER_LIST,
              hidden: !permissions.includes(Permission.Hr_Access),
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
              hidden: !permissions.includes(
                Permission.Academic_ListAcademicSubjects,
              ),
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
              hidden: !permissions.includes(Permission.Academic_ListCourses),
              active: !!matchPath(window.location.pathname, {
                path: ACADEMIC_COURSE_LIST,
                exact: false,
                strict: false,
              }),
            },
          ],
        },
        {
          key: 'teaching',
          title: 'Đang Dạy',
          icon: BookOpen,
          hidden: !permissions.includes(Permission.Teaching_Course_Access),
          items: [
            {
              key: 'courses',
              label: 'Khóa học',
              link: TEACHING_COURSE_LIST,
              hidden: !permissions.includes(Permission.Teaching_Course_Access),
              active: !!matchPath(window.location.pathname, {
                path: TEACHING_COURSE_LIST,
                exact: false,
                strict: false,
              }),
            },
          ],
        },
        {
          key: 'studying',
          title: 'Đang Học',
          icon: GraduationCap,
          hidden: !permissions.includes(Permission.Studying_Course_Access),
          items: [
            {
              key: 'courses',
              label: 'Khóa học',
              link: STUDYING_COURSE_LIST,
              hidden: !permissions.includes(Permission.Studying_Course_Access),
              active: !!matchPath(window.location.pathname, {
                path: STUDYING_COURSE_LIST,
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
          hidden: !permissions.includes(Permission.OrgOffice_Access),
          items: [
            {
              key: 'org-settings',
              label: 'Cài đặt tổ chức',
              link: ORG_SETTINGS,
              hidden: !permissions.includes(Permission.OrgOffice_Access),
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
}

export default OrgSidebar
