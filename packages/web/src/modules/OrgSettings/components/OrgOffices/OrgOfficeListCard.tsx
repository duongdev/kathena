import { FC, useCallback, useState } from 'react'

import { CardContent, makeStyles } from '@material-ui/core'
import { Plus } from 'phosphor-react'

import { ANY } from '@kathena/types'
import {
  Button,
  SectionCard,
  useDialogState,
  withComponentHocs,
} from '@kathena/ui'
import { RequiredPermission } from 'common/auth'
import { Permission } from 'graphql/generated'

import CreateOrgOfficeDialog from './CreateOrgOfficeDialog'
import OrgOfficeList from './OrgOfficeList'
import UpdateOrgOfficeDialog from './UpdateOrgOfficeDialog'

export type OrgOfficeListCardProps = {}

const OrgOfficeListCard: FC<OrgOfficeListCardProps> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const classes = useStyles(props)
  const [
    createDialogOpen,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
  ] = useDialogState()
  const [
    updateDialogOpen,
    handleOpenUpdateDialog,
    handleCloseUpdateDialog,
  ] = useDialogState()
  const [valueUpdate, setValueUpdate] = useState({ id: '' })

  const receiveValueUpdate = useCallback(
    (value) => {
      setValueUpdate(value)
      handleOpenUpdateDialog()
    },
    [setValueUpdate, handleOpenUpdateDialog],
  )

  return (
    <SectionCard
      title="Văn phòng"
      action={
        <RequiredPermission permission={Permission.OrgOffice_CreateOrgOffice}>
          <Button
            startIcon={<Plus />}
            size="small"
            onClick={handleOpenCreateDialog}
          >
            Thêm văn phòng
          </Button>
        </RequiredPermission>
      }
    >
      <RequiredPermission permission={Permission.OrgOffice_CreateOrgOffice}>
        <CreateOrgOfficeDialog
          open={createDialogOpen}
          onClose={handleCloseCreateDialog}
        />
      </RequiredPermission>
      <RequiredPermission permission={Permission.OrgOffice_UpdateOrgOffice}>
        <UpdateOrgOfficeDialog
          open={updateDialogOpen}
          onClose={handleCloseUpdateDialog}
          orgOffice={valueUpdate as ANY}
        />
      </RequiredPermission>
      <CardContent>
        <OrgOfficeList receiveUpdateOrgOfficeValue={receiveValueUpdate} />
      </CardContent>
    </SectionCard>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default withComponentHocs(OrgOfficeListCard)
