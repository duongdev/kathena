/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
import React, { ComponentType, FC, ReactNode } from 'react'

import { Grid, GridProps } from '@material-ui/core'

export type GridItemContainerProps = {
  gridItem?: boolean | GridProps
  gridProps?: GridProps
}

const GridItemContainer: FC<GridItemContainerProps> = (props) => {
  if (props.gridItem || props.gridProps) {
    const gridProps = {
      ...(typeof props.gridItem === 'object' ? props.gridItem : {}),
      ...props.gridProps,
    }

    return (
      <Grid item {...gridProps}>
        {props.children}
      </Grid>
    )
  }
  return <>{props.children}</>
}

export const withGridItem =
  <BaseComponentProps extends object>(
    BaseComponent: ComponentType<BaseComponentProps>,
  ) =>
  (
    props: BaseComponentProps &
      GridItemContainerProps & { children?: ReactNode },
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { gridItem, gridProps, ...baseComponentProps } = props
    return (
      <GridItemContainer {...props}>
        <BaseComponent {...(baseComponentProps as any)} />
      </GridItemContainer>
    )
  }

export default GridItemContainer
