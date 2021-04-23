import { FC, useMemo } from 'react'

import {
  ListItem,
  ListItemText,
  makeStyles,
  List,
  ListItemSecondaryAction,
  IconButton,
} from '@material-ui/core'
import { Pencil } from 'phosphor-react'

import { ANY } from '@kathena/types'
import { ApolloErrorList, Typography } from '@kathena/ui'
import { ContentSkeleton } from '@kathena/ui/skeletons/ContentSkeleton'
import { useListOrgOfficesQuery } from 'graphql/generated'

export type OrgOfficeListProps = {
  receiveUpdateOrgOfficeValue: ANY
}

const OrgOfficeList: FC<OrgOfficeListProps> = (props) => {
  const classes = useStyles(props)
  const { data, loading, error } = useListOrgOfficesQuery()

  const orgOffices = useMemo(() => data?.orgOffices ?? [], [data?.orgOffices])

  if (error) {
    return <ApolloErrorList error={error} />
  }

  if (loading) {
    return <ContentSkeleton />
  }

  if (!orgOffices.length) {
    return <Typography>Chưa có văn phòng nào</Typography>
  }

  return (
    <List disablePadding className={classes.root}>
      {orgOffices.map((orgOffice) => (
        <ListItem key={orgOffice.id} disableGutters>
          <ListItemText
            primary={orgOffice.name}
            secondary={`${orgOffice.phone} – ${orgOffice.address}`}
          />
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => props.receiveUpdateOrgOfficeValue(orgOffice)}
            >
              <Pencil />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default OrgOfficeList
