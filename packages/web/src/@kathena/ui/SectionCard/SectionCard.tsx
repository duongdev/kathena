/* eslint-disable react/destructuring-assignment */
import React, { ReactNode, useMemo } from 'react'

import {
  Box,
  Card,
  CardHeader,
  CardHeaderProps,
  Fade,
  makeStyles,
  SvgIconTypeMap,
  Theme,
} from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'

import { DASHBOARD_CARD_CONTENT_MAX_HEIGHT } from '@kathena/theme/theme.constants'

import Button from '../Button'
import withComponentHocs from '../hocs/withComponentHocs'

export type SectionCardProps = {
  title: ReactNode
  titleIcon?: OverridableComponent<SvgIconTypeMap<{}, 'svg'>>
  action?: CardHeaderProps['action']
  classes?: Partial<Record<'root' | 'content', string>>
  disableFade?: boolean
  fullHeight?: boolean
  maxContentHeight?: number | false
}

const SectionCard: React.FC<SectionCardProps> = (props) => {
  const classes = useStyles(props)

  const title = useMemo(() => {
    if (props.titleIcon) {
      return (
        <Box sx={{ display: 'flex' }}>
          <Box component={props.titleIcon} sx={{ marginRight: 1 }} />{' '}
          {props.title}
        </Box>
      )
    }

    return props.title
  }, [props.title, props.titleIcon])

  const card = useMemo(
    () => (
      <Card className={classes.root}>
        <CardHeader title={title} action={props.action} />
        <div className={classes.content}>{props.children}</div>
      </Card>
    ),
    [classes.content, classes.root, props.action, props.children, title],
  )

  if (props.disableFade) {
    return card
  }

  return <Fade in>{card}</Fade>
}

export type SectionCardMoreActionProps = {
  to: string
  label?: string
}

export const SectionCardMoreAction: React.FC<SectionCardMoreActionProps> = (
  props,
) => (
  <Button link={props.to} size="small">
    {props.label || 'More'}
  </Button>
)

const useStyles = makeStyles<Theme, SectionCardProps, 'root' | 'content'>(
  () => ({
    root: {
      height: ({ fullHeight }) => (fullHeight ? '100%' : undefined),
      display: 'flex',
      flexDirection: 'column',
    },
    content: ({ maxContentHeight }) =>
      maxContentHeight
        ? {
            maxHeight: maxContentHeight,
            overflow: 'auto',
            height: '100%',
          }
        : { height: '100%' },
  }),
)

SectionCard.defaultProps = {
  fullHeight: true,
  maxContentHeight: DASHBOARD_CARD_CONTENT_MAX_HEIGHT,
}

export default withComponentHocs(SectionCard)
