/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC } from 'react'

import {
  Box,
  BoxProps,
  CircularProgress,
  Fade,
  LinearProgress,
  makeStyles,
} from '@material-ui/core'
import clsx from 'clsx'
import { ANY } from 'core/types'

export type SpinnerProps = {
  /**
   * @default circular
   */
  variant?: 'circular' | 'linear'
  /**
   * @default default
   */
  container?: 'default' | 'fullscreen' | 'overlay'
  center?: boolean
  padding?: number
  p?: number
  sx?: BoxProps['sx']
  /** In millisecond. Defaults to 300ms. */
  delay?: number
  className?: string
}

const Spinner: FC<SpinnerProps> = (props) => {
  const classes = useStyles(props)
  const { variant, container, padding, p, center, sx, ...rest } = props

  const SpinnerComponent =
    props.variant === 'linear'
      ? LinearProgress
      : (_props: ANY) => (
          <div style={{ position: 'relative', display: 'flex' }}>
            <div
              style={{
                border: `solid 3.6px #e6e6e6`,
                borderRadius: '50%',
                padding: 3.6,
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
            />
            <CircularProgress disableShrink {..._props} />
          </div>
        )

  switch (container) {
    case 'fullscreen':
      return (
        <Fade
          in
          unmountOnExit
          style={{
            transitionDelay: `${props.delay ?? 300}ms`,
          }}
        >
          <div className={clsx(classes.root, 'fullscreen', props.className)}>
            <SpinnerComponent {...rest} />
          </div>
        </Fade>
      )

    case 'overlay':
      return (
        <Fade
          in
          unmountOnExit
          style={{
            transitionDelay: `${props.delay || 300}ms`,
          }}
        >
          <div className={clsx(classes.root, 'overlay', props.className)}>
            <SpinnerComponent className={variant} {...rest} />
          </div>
        </Fade>
      )

    default:
      return (
        <Fade
          in
          unmountOnExit
          style={{
            transitionDelay: `${props.delay || 300}ms`,
          }}
        >
          <Box
            sx={{
              padding: padding ?? p,
              ...(center
                ? {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                : { display: 'flex' }),
              ...sx,
            }}
          >
            <SpinnerComponent {...rest} />
          </Box>
        </Fade>
      )
  }
}

Spinner.defaultProps = {
  variant: 'circular',
  container: 'default',
}

const useStyles = makeStyles(() => ({
  root: {
    '&.fullscreen': {
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    '&.overlay': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 11,

      '& > .linear': {
        width: '100%',
        marginBottom: 'auto',
      },
    },
  },
}))

export default Spinner
