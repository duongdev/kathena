/* eslint-disable no-restricted-imports */
/* eslint-disable react/jsx-props-no-spreading */
import { FC, forwardRef } from 'react'

import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link'
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom'

import withComponentHocs from '../hocs/withComponentHocs'

export type LinkProps = RouterLinkProps & MuiLinkProps

const Link: FC<LinkProps> = forwardRef((props, ref) => (
  <MuiLink ref={ref} component={RouterLink} {...props} />
))

export default withComponentHocs(Link)
