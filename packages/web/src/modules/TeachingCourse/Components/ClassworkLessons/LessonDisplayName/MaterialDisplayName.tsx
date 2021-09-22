/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'

import { makeStyles, Skeleton } from '@material-ui/core'
import clsx from 'clsx'

import { Typography, TypographyProps } from '@kathena/ui'
import {
  ClassworkMaterial,
  useDetailClassworkMaterialQuery,
} from 'graphql/generated'

import useClassworkMaterialUtils from './useMaterialUtils'

export type MaterialDisplayNameWithId = {
  materialId: string
}

export type MaterialDisplayNameWithAccount = {
  material: Pick<ClassworkMaterial, 'id' | 'description' | 'title'>
}

export type MaterialDisplayNameProps = { maxWidth?: number } & TypographyProps &
  (MaterialDisplayNameWithId | MaterialDisplayNameWithAccount)

const MaterialDisplayName: FC<MaterialDisplayNameProps> = (props) => {
  const { className, maxWidth, ...TypoProps } = props
  const { materialId } = props as MaterialDisplayNameWithId
  const { material: materialProp } = props as MaterialDisplayNameWithAccount

  const classes = useStyles(props)
  const { getUserName } = useClassworkMaterialUtils()
  const { data, loading } = useDetailClassworkMaterialQuery({
    variables: { Id: materialId },
    skip: !!materialProp,
  })

  const material = useMemo(
    () => materialProp || data?.classworkMaterial,
    [materialProp, data?.classworkMaterial],
  )
  const title = useMemo(
    () => (material ? getUserName(material) : ''),
    [material, getUserName],
  )

  if (loading) return <Skeleton variant="text" className={classes.skeleton} />

  return (
    <Typography
      className={clsx(className, classes.root)}
      style={{ maxWidth }}
      noWrap
      title={title}
      {...TypoProps}
    >
      {title}
    </Typography>
  )
}

const useStyles = makeStyles(() => ({
  root: {
    cursor: 'default',
    maxWidth: 500,
    overflow: 'hidden',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  skeleton: {
    maxWidth: 180,
    height: 27,
  },
}))

export default MaterialDisplayName
