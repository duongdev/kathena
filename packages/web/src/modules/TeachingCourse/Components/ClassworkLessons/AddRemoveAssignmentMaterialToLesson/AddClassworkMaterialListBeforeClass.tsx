import { FC, useEffect, useState } from 'react'

import { makeStyles, Grid } from '@material-ui/core'
import { useSnackbar } from 'notistack'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { Dialog, usePagination, SectionCardSkeleton, Button } from '@kathena/ui'
import {
  FindLessonByIdDocument,
  Lesson,
  useUpdateLessonMutation,
  useClassworkMaterialsListQuery,
} from 'graphql/generated'

import MaterialDisplayName from '../LessonDisplayName/MaterialDisplayName'

export type AddClassworkMaterialListBeforeClassProps = {
  open: boolean
  onClose: () => void
  idCourse: string
  lesson: Pick<
    Lesson,
    | 'description'
    | 'startTime'
    | 'endTime'
    | 'courseId'
    | 'id'
    | 'publicationState'
    | 'absentStudentIds'
    | 'classworkMaterialListBeforeClass'
    | 'classworkMaterialListInClass'
    | 'classworkMaterialListAfterClass'
    | 'classworkAssignmentListBeforeClass'
    | 'classworkAssignmentListInClass'
    | 'classworkAssignmentListAfterClass'
  >
}

const AddClassworkMaterialListBeforeClass: FC<AddClassworkMaterialListBeforeClassProps> =
  (props) => {
    const { open, onClose, lesson, idCourse } = props
    const classes = useStyles(props)
    const [materials, setMaterials] = useState<string[]>([])

    const [
      classworkMaterialListBeforeClass,
      setClassworkMaterialListBeforeClass,
    ] = useState<string[]>(lesson.classworkMaterialListBeforeClass ?? [])

    // Cập nhật buổi học (Lesson)
    const [loading, setLoading] = useState(false)
    const { enqueueSnackbar } = useSnackbar()
    const [updateLesson] = useUpdateLessonMutation({
      refetchQueries: [
        {
          query: FindLessonByIdDocument,
          variables: { lessonId: lesson?.id ?? '' },
        },
      ],
    })
    // Lấy danh sách tài liệu từ có sở dữ liệu
    const { page, perPage } = usePagination()
    const { data: dataClasswork, loading: loadingClasswork } =
      useClassworkMaterialsListQuery({
        variables: {
          courseId: lesson.courseId,
          limit: perPage,
          skip: page * perPage,
        },
      })
    // Lấy ID tài liệu từ danh sách tài liệu
    useEffect(() => {
      const course = dataClasswork?.classworkMaterials
      if (course?.classworkMaterials && course.classworkMaterials.length > 0) {
        const listMaterial = course.classworkMaterials.map((item) => item.id)
        setMaterials(listMaterial)
      } else {
        setMaterials([])
      }
    }, [dataClasswork])

    // Lấy Danh sách tài liệu trước buổi học
    useEffect(() => {
      setClassworkMaterialListBeforeClass(
        lesson.classworkMaterialListBeforeClass ?? [],
      )
    }, [open, lesson?.classworkMaterialListBeforeClass])

    const toggleClick = (id: string) => {
      const arr = [...classworkMaterialListBeforeClass]
      const index = arr.findIndex((i) => i === id)
      if (index > -1) {
        arr.splice(index, 1)
      } else {
        arr.push(id)
      }
      setClassworkMaterialListBeforeClass(arr)
    }

    // Kiểm tra bên phía loading
    if (loadingClasswork) {
      return (
        <Grid container spacing={DASHBOARD_SPACING}>
          <Grid item xs={12}>
            <SectionCardSkeleton />
          </Grid>
        </Grid>
      )
    }
    const handleUpdate = async () => {
      if (lesson) {
        setLoading(true)
        const lessonUpdate = await updateLesson({
          variables: {
            courseId: idCourse,
            lessonId: lesson.id,
            updateInput: {
              classworkMaterialListBeforeClass,
            },
          },
        })
        if (lessonUpdate) {
          enqueueSnackbar(`Thêm thành công`, { variant: 'success' })
        } else {
          enqueueSnackbar(`Thêm thất bại`, { variant: 'error' })
        }
        setLoading(false)
      } else {
        enqueueSnackbar(`Thêm thất bại`, { variant: 'error' })
      }
    }

    return (
      <Dialog
        open={open}
        onClose={onClose}
        width={770}
        dialogTitle="Danh sách tài liệu"
        extraDialogActions={
          <Button onClick={handleUpdate} loading={loading}>
            Lưu
          </Button>
        }
      >
        <>
          <div className={classes.root}>
            {materials.map((item) => {
              const inTheListMaterial =
                classworkMaterialListBeforeClass.findIndex((i) => i === item) >
                -1
              return (
                <div
                  onClick={() => toggleClick(item)}
                  className={`${classes.item} ${
                    inTheListMaterial ? classes.active : ''
                  }`}
                >
                  <MaterialDisplayName materialId={item} />
                </div>
              )
            })}
          </div>
        </>
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
    alignItems: 'left',
    justifyContent: 'center',
    width: '100%',
    height: '40px',
    margin: '5px',
    paddingLeft: '1em',
    borderRadius: '5px',
    background: '#f2f2f2  ',
  },
  active: {
    background: '#32CD32',
  },
}))

export default AddClassworkMaterialListBeforeClass
