import { FC, ReactNode } from 'react'

import { AppBar, Drawer, makeStyles, Toolbar } from '@material-ui/core'

import { APP_BAR_HEIGHT, SIDEBAR_WIDTH } from '@kathena/theme'
import { TODO } from '@kathena/types'

export type DashboardContainerProps = {
  sidebar?: ReactNode
  toolbar?: ReactNode
}

const DashboardContainer: FC<DashboardContainerProps> = (props) => {
  const classes = useStyles(props)
  const { children, sidebar, toolbar } = props

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        className={classes.appBar}
      >
        <Toolbar className={classes.toolbar}>{toolbar}</Toolbar>
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

      <div className={classes.content}>{children}</div>
    </div>
  )
}

const useStyles = makeStyles(({ zIndex }) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    borderBottom: 'solid 2px #fcbf16',
    height: APP_BAR_HEIGHT,
    zIndex: `${zIndex.drawer + 1} !important` as TODO,
    backgroundColor: '#103955',
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
