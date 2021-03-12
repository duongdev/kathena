import { FC, ReactNode } from 'react'

import { APP_BAR_HEIGHT, SIDEBAR_WIDTH } from '@kathena/theme'
import { TODO } from '@kathena/types'
import { AppBar, Drawer, makeStyles, Toolbar } from '@material-ui/core'

export type DashboardContainerProps = {
  sidebar?: ReactNode
}

const DashboardContainer: FC<DashboardContainerProps> = (props) => {
  const classes = useStyles(props)
  const { children, sidebar } = props

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        className={classes.appBar}
      >
        <Toolbar className={classes.toolbar}>Content</Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        {sidebar}
      </Drawer>

      <main className={classes.content}>{children}</main>
    </div>
  )
}

const useStyles = makeStyles(({ palette, zIndex }) => ({
  root: { display: 'flex' },
  appBar: {
    borderBottom: `solid 1px ${palette.divider}`,
    height: APP_BAR_HEIGHT,
    zIndex: `${zIndex.drawer + 1} !important` as TODO,
  },
  toolbar: {
    height: APP_BAR_HEIGHT,
  },
  drawer: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
  },
  drawerPaper: {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    borderRight: 'none',
    paddingTop: APP_BAR_HEIGHT,
  },
  content: {
    flexGrow: 1,
    marginTop: APP_BAR_HEIGHT,
  },
}))

export default DashboardContainer
