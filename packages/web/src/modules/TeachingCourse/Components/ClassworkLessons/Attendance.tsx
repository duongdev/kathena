import { FC, useEffect, useState } from 'react'

import { makeStyles } from '@material-ui/core'
import AccountAvatar from 'components/AccountAvatar/AccountAvatar'
import AccountDisplayName from 'components/AccountDisplayName'

import { ANY } from '@kathena/types'
import { Button, Dialog } from '@kathena/ui'
import { Maybe, Publication, useFindCourseByIdQuery } from 'graphql/generated'

export type AttendanceProps = {
  open: boolean
  onClose: () => void
  idCourse: string
  lesson:
    | {
        id: string
        orgId: string
        createdAt: ANY
        updatedAt: ANY
        createdByAccountId: string
        startTime: ANY
        endTime: ANY
        description?: Maybe<string> | undefined
        absentStudentIds: string[]
        courseId: string
        publicationState: Publication
        avgNumberOfStars: number
      }
    | undefined
}

const Attendance: FC<AttendanceProps> = (props) => {
  const { open, onClose, lesson } = props
  const classes = useStyles(props)
  const [students, setStudents] = useState<string[]>([])
  const [absentStudentIds, setAbsentStudentIds] = useState<string[]>(
    lesson?.absentStudentIds ?? [],
  )
  const { data: dataCourse } = useFindCourseByIdQuery({
    variables: {
      id: props.idCourse,
    },
  })

  useEffect(() => {
    const course = dataCourse?.findCourseById
    if (course?.studentIds && course.studentIds.length > 0) {
      setStudents(course.studentIds)
    } else {
      setStudents([])
    }
  }, [dataCourse])

  const toggleClick = (id: string) => {
    const arr = [...absentStudentIds]
    const index = arr.findIndex((i) => i === id)
    if (index > -1) {
      arr.splice(index, 1)
    } else {
      arr.push(id)
    }
    setAbsentStudentIds(arr)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={<h3 style={{ margin: 0 }}>Điểm danh</h3>}
      width={770}
      extraDialogActions={<Button>Lưu</Button>}
    >
      <div className={classes.root}>
        {students.map((item) => {
          const absent = absentStudentIds.findIndex((i) => i === item) > -1
          return (
            <div
              onClick={() => toggleClick(item)}
              className={`${classes.item} ${absent ? classes.active : ''}`}
            >
              <AccountAvatar accountId={item} />
              <AccountDisplayName accountId={item} />
            </div>
          )
        })}
      </div>
    </Dialog>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  item: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 80,
    margin: '5px',
    borderRadius: '5px',
    background: '#f2f2f2  ',
  },
  active: {
    background: '#ff3737',
  },
}))

export default Attendance
