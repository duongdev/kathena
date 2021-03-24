import { FC } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer, SectionCard } from '@kathena/ui'

import CreateUpdateAcademicSubjectForm, {
  AcademicSubjectFormInput,
} from './CreateUpdateAcademicSubject.form'

export type CreateUpdateAcademicSubjectProps = {}
type UpdateParams = {
  id: string
}
const CreateUpdateAcademicSubject: FC<CreateUpdateAcademicSubjectProps> = (
  props,
) => {
  const classes = useStyles(props)

  const params: UpdateParams = useParams()
  let createMode = true
  let initialValues: AcademicSubjectFormInput = {
    name: '',
    description: '',
    tuitionFee: null,
  }

  if (params.id) {
    createMode = false
    initialValues = {
      // Get academic subject by id
      name: 'HTML',
      description: 'Front End Cơ Bản',
      tuitionFee: 5000000,
    }
  }
  return (
    <div className={classes.root}>
      <PageContainer withBackButton maxWidth="sm" title="Academic Subject">
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title={createMode ? 'Thêm Môn Học' : 'Cập Nhật Môn Học'}
          >
            <CardContent>
              <CreateUpdateAcademicSubjectForm
                initialValues={initialValues}
                createMode={createMode}
              />
            </CardContent>
          </SectionCard>
        </Grid>
      </PageContainer>
    </div>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default CreateUpdateAcademicSubject
