import { FC, useMemo } from 'react'

import { CardContent, Grid, makeStyles } from '@material-ui/core'
import { useParams } from 'react-router-dom'

import { DASHBOARD_SPACING } from '@kathena/theme'
import { PageContainer, SectionCard } from '@kathena/ui'

import OrgOfficeEditorForm, {
  OrgOfficeEditorFormInput,
} from './OrgOfficeEditor.form'

export type OrgOfficeEditorProps = {}
type UpdateParams = {
  id: string
}
const OrgOfficeEditor: FC<OrgOfficeEditorProps> = (props) => {
  const classes = useStyles(props)

  const params: UpdateParams = useParams()
  const createMode = useMemo(() => !params.id, [params.id])
  const initialValues: OrgOfficeEditorFormInput = useMemo(
    () =>
      createMode
        ? {
            name: '',
            address: '',
            phone: '',
          }
        : {
            // Get orgOffice by id
            name: 'Kmin Academy',
            address: '25A Mai Thi Luu, Phuong Dakao, Q1, TPHCM',
            phone: '0704917152',
          },
    [createMode],
  )

  return (
    <div className={classes.root}>
      <PageContainer withBackButton maxWidth="sm" title="OrgOffice">
        <Grid container spacing={DASHBOARD_SPACING}>
          <SectionCard
            maxContentHeight={false}
            gridItem={{ xs: 12 }}
            title={createMode ? 'Thêm Chi Nhánh' : 'Cập Nhật Chi Nhánh'}
          >
            <CardContent>
              <OrgOfficeEditorForm
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

export default OrgOfficeEditor
