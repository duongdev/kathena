import { ForwardRefExoticComponent } from 'react'

import { IconProps } from 'phosphor-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ANY = any
export type TODO = ANY

// eslint-disable-next-line @typescript-eslint/ban-types
export type OBJECT = object

export type Icon = ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>
