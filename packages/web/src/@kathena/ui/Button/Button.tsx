/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import { FC, Fragment, useMemo } from 'react'

import {
  darken,
  // eslint-disable-next-line no-restricted-imports
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  makeStyles,
  Theme,
  Tooltip,
  TooltipProps,
} from '@material-ui/core'
// eslint-disable-next-line no-restricted-imports
import { Link, LinkProps } from 'react-router-dom'

import { ANY, TODO } from '@kathena/types'

import withComponentHocs from '../hocs/withComponentHocs'

// import Link, { LinkProps } from '../Link'

const SPINNER_SIZE = {
  small: 18,
  medium: 20,
  large: 22,
}
const ACTIVE_DARKEN = 0.5

export type ButtonProps = MuiButtonProps & {
  rounded?: boolean
  iconOnly?: boolean
  component?: TODO
  link?: string | LinkProps
  loading?: boolean
  labelColor?: 'default' | 'primary' | 'secondary'
  tooltip?: string | TooltipProps
}

const Button: FC<ButtonProps> = (props) => {
  const classes = useStyles(props)
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rounded = false,
    iconOnly = false,
    link,
    loading,
    disabled,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    labelColor,
    tooltip,
    size = 'medium',
    ...restMuiButtonProps
  } = props

  const Container = useMemo(() => {
    if (typeof tooltip === 'undefined') {
      return Fragment
    }
    const tooltipProps: Omit<TooltipProps, 'children'> =
      typeof tooltip === 'string' ? { title: tooltip } : tooltip
    return ({ children }: { children: TooltipProps['children'] }) => (
      <Tooltip {...tooltipProps}>{children}</Tooltip>
    )
  }, [tooltip])

  const btnProps = useMemo(() => {
    let buttonProps: Partial<ButtonProps> = {
      classes,
      disabled: loading || disabled,
      startIcon:
        loading && !iconOnly ? (
          <CircularProgress
            disableShrink
            size={SPINNER_SIZE[size]}
            color={props.color === 'inherit' ? 'inherit' : props.color}
          />
        ) : (
          props.startIcon
        ),
    }

    if (link) {
      const linkProps: ANY = typeof link === 'string' ? { to: link } : link
      buttonProps = {
        ...buttonProps,
        component: Link,
        ...linkProps,
      }
    }

    return buttonProps
  }, [
    classes,
    loading,
    disabled,
    iconOnly,
    props.color,
    props.startIcon,
    link,
    size,
  ])

  return (
    <Container>
      <MuiButton size={size} {...restMuiButtonProps} {...btnProps} />
    </Container>
  )
}

const useStyles = makeStyles<Theme, ButtonProps>(
  ({ palette, spacing, components, transitions }) => ({
    root: ({ rounded, iconOnly }) => {
      const css: ANY = {
        transition: transitions.create(
          [
            'background-color',
            'box-shadow',
            'border-color',
            'color',
            'opacity',
          ],
          {
            duration: transitions.duration.short,
          },
        ),
      }

      if (rounded) {
        css.borderRadius = '1000px !important'
      }

      if (iconOnly) {
        css.minWidth = 'unset'
        css.padding = 0
        css.width =
          (components?.MuiButton?.styleOverrides?.root as ANY)?.height ?? 44
      }

      return css
    },
    containedPrimary: {
      '&:active': {
        backgroundColor: darken(palette.primary.main, ACTIVE_DARKEN),
      },
    },
    containedSecondary: {
      '&:active': {
        backgroundColor: darken(palette.secondary.main, ACTIVE_DARKEN),
      },
    },
    outlined: {
      '&:active': {
        opacity: 0.7,
      },
    },
    text: {
      '&:active': {
        opacity: 0.7,
      },
    },
    sizeSmall: ({ iconOnly }) =>
      iconOnly
        ? {
            width:
              (components?.MuiButton?.styleOverrides?.sizeSmall as ANY)
                ?.height ?? 34,
            height:
              (components?.MuiButton?.styleOverrides?.sizeSmall as ANY)
                ?.height ?? 34,
            padding: spacing(0.5),
          }
        : {},
    sizeMedium: ({ iconOnly }) =>
      iconOnly
        ? {
            width:
              (components?.MuiButton?.styleOverrides?.sizeMedium as ANY)
                ?.height ?? 40,
            height:
              (components?.MuiButton?.styleOverrides?.sizeMedium as ANY)
                ?.height ?? 40,
          }
        : {},
    sizeLarge: ({ iconOnly }) =>
      iconOnly
        ? {
            width:
              (components?.MuiButton?.styleOverrides?.sizeLarge as ANY)
                ?.height ?? 45,
            height:
              (components?.MuiButton?.styleOverrides?.sizeLarge as ANY)
                ?.height ?? 45,
          }
        : {},
    label: ({ iconOnly, labelColor, disabled, loading, size }) => {
      const isDisabled = disabled || loading
      const css: ANY = {}

      if (iconOnly) {
        css.margin = 0
      } else if (size === 'small') {
        css.marginTop = -1
        css.marginBottom = 1
      }

      if (!isDisabled) {
        if (labelColor === 'primary') {
          css.color = palette.primary.main
        } else if (labelColor === 'secondary') {
          css.color = palette.secondary.main
        }
      }

      return css
    },
  }),
)

export default withComponentHocs(Button)
