import { FC } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import { Plus } from 'phosphor-react'

import {
  Button,
  SectionCard,
  useDialogState,
  withComponentHocs,
} from '@kathena/ui'

import CreateOrgOfficeDialog from './CreateOrgOfficeDialog'
import OrgOfficeList from './OrgOfficeList'

export type OrgOfficeListCardProps = {}

const OrgOfficeListCard: FC<OrgOfficeListCardProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const [
    createDialogOpen,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
  ] = useDialogState()

  return (
    <SectionCard
      title="Văn phòng"
      action={
        <Button
          startIcon={<Plus />}
          size="small"
          onClick={handleOpenCreateDialog}
        >
          Thêm văn phòng
        </Button>
      }
    >
      <CreateOrgOfficeDialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
      />
      <CardContent>
        <OrgOfficeList />
      </CardContent>
    </SectionCard>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default withComponentHocs(OrgOfficeListCard)
