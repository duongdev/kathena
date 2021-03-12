import { FC } from 'react'

import { Icon } from '@kathena/types'
import { Grid, GridProps, makeStyles } from '@material-ui/core'

import Typography from '../Typography'

const ICON_SIZE = 32

export type MenuEntity = {
  key: string
  title: string
  icon: Icon
  items: {
    key: string
    label: string
  }[]
}

export type SidebarMenuProps = {
  menus: MenuEntity[]
  menuSpacing?: GridProps['spacing']
  menuItemSpacing?: GridProps['spacing']
}

const SidebarMenu: FC<SidebarMenuProps> = (props) => {
  const classes = useStyles(props)
  const { menuSpacing = 2, menuItemSpacing = 1, menus } = props

  return (
    <div className={classes.root}>
      <Grid container spacing={menuSpacing} direction="column" wrap="nowrap">
        {menus.map((menu) => (
          <Grid item key={menu.key}>
            <div>
              <div className={classes.menuTitle}>
                <menu.icon
                  size={ICON_SIZE}
                  fill="duotone"
                  className={classes.menuTitleIcon}
                />
                <Typography
                  variant="button"
                  fontWeight="bold"
                  className={classes.menuTitleText}
                >
                  {menu.title}
                </Typography>
              </div>
              <div className={classes.menuItems}>
                <Grid
                  container
                  spacing={menuItemSpacing}
                  direction="column"
                  wrap="nowrap"
                >
                  {menu.items.map((item) => (
                    <Grid item key={item.key}>
                      <Typography variant="body2">{item.label}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  )
}

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    padding: spacing(4, 2),
  },
  menuTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing(1),
  },
  menuTitleIcon: {
    color: palette.text.secondary,
    marginRight: spacing(2),
  },
  menuTitleText: {},
  menuItems: {
    paddingLeft: `calc(${ICON_SIZE}px + ${spacing(2)})`,
  },
}))

export default SidebarMenu
