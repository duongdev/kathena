/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC } from 'react'

import { alpha, makeStyles, Theme } from '@material-ui/core'
import clsx from 'clsx'

import { SemanticColor } from '../../theme/theme'
import { withGridItem } from '../GridItemContainer'
import Typography from '../Typography'

export type StatusChipProps = {
  /**
   * @default green
   */
  color?: keyof SemanticColor
  /**
   * @default text
   */
  variant?: 'contained' | 'text' | 'outlined'
  /**
   * @default medium
   */
  size?: 'small' | 'medium' | 'large'
}

const StatusChip: FC<StatusChipProps> = (props) => {
  const classes = useStyles(props)

  return (
    <div
      className={clsx(
        classes.root,
        `variant-${props.variant}`,
        `size-${props.size}`,
      )}
    >
      <Typography
        variant="button"
        className={clsx(classes.typography, `typographySize-${props.size}`)}
      >
        {props.children}
      </Typography>
    </div>
  )
}

const useStyles = makeStyles<Theme, StatusChipProps>(
  ({ spacing, palette }) => ({
    root: ({ color }) => ({
      display: 'inline-block',
      '&.variant-contained': {
        backgroundColor: palette.semantic[color!],
        color: palette.common.white,
        borderRadius: 1000,
        '&.size-small': {
          padding: spacing(0.5, 1),
        },
        '&.size-medium': {
          padding: spacing(0.75, 2),
        },
        '&.size-large': {
          padding: spacing(1, 2),
        },
      },
      '&.variant-outlined': {
        color: palette.semantic[color!],
        borderRadius: 1000,
        border: `solid 1px ${palette.semantic[color!]}`,
        backgroundColor: alpha(palette.semantic[color!], 0.075),
        '&.size-small': {
          padding: spacing(0.5, 1),
        },
        '&.size-medium': {
          padding: spacing(0.75, 2),
        },
        '&.size-large': {
          padding: spacing(1, 2),
        },
      },
      '&.variant-text': {
        color: palette.semantic[color!],
      },
    }),
    typography: {
      display: 'flex',
      alignItems: 'center',
      marginTop: 1,
      marginBottom: -1,
      textTransform: 'uppercase',
      '&.typographySize-small': {
        fontSize: '0.75rem',
        marginTop: 0,
        marginBottom: 0,
      },
      '&.typographySize-large': {
        fontSize: '0.95rem',
      },
    },
  }),
)

StatusChip.defaultProps = {
  color: 'green',
  variant: 'text',
  size: 'medium',
}

export default withGridItem(StatusChip)
