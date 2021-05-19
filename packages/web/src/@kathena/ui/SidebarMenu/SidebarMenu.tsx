/* eslint-disable react/jsx-props-no-spreading */
import { FC } from 'react'

import { Grid, GridProps, makeStyles } from '@material-ui/core'
import clsx from 'clsx'

import { Icon } from '@kathena/types'

import Link, { LinkProps } from '../Link'
import Typography from '../Typography'

const ICON_SIZE = 24

export type MenuItemProps = {
  key: string
  label: string
  link?: LinkProps | string
  active?: boolean
  hidden?: boolean
}

export type MenuEntity = {
  key: string
  title: string
  icon: Icon
  items: MenuItemProps[]
  hidden?: boolean
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
        {menus.map((menu) => {
          if (typeof menu.hidden !== 'undefined' && menu.hidden === true)
            return null
          return (
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
                    {menu.items.map((item) => {
                      if (
                        typeof item.hidden !== 'undefined' &&
                        item.hidden === true
                      )
                        return null
                      return (
                        <Grid item key={item.key}>
                          <MenuItem {...item} />
                        </Grid>
                      )
                    })}
                  </Grid>
                </div>
              </div>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

const MenuItem: FC<MenuItemProps> = (props) => {
  const classes = useStyles(props)
  const { label, link, active } = props

  if (link) {
    if (typeof link === 'string') {
      return (
        <Typography
          variant="body2"
          className={clsx(classes.menuItem, { active })}
        >
          <Link to={link}>{label}</Link>
        </Typography>
      )
    }
    return (
      <Typography
        variant="body2"
        className={clsx(classes.menuItem, { active })}
      >
        <Link {...link}>{label}</Link>
      </Typography>
    )
  }

  return (
    <Typography variant="body2" className={clsx(classes.menuItem, { active })}>
      {label}
    </Typography>
  )
}

const useStyles = makeStyles(
  ({ spacing, palette, transitions, typography }) => ({
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
    menuTitleText: { fontSize: typography.body2.fontSize },
    menuItems: {
      paddingLeft: `calc(${ICON_SIZE}px + ${spacing(2)})`,
    },
    menuItem: {
      color: palette.text.primary,
      opacity: 0.65,
      transition: transitions.create(['opacity', 'color'], {
        duration: transitions.duration.standard,
        easing: transitions.easing.easeInOut,
      }),
      '& *': {
        color: 'inherit',
        textDecoration: 'none !important',
        cursor: 'pointer',
      },
      '&:hover': { opacity: 0.875 },
      '&.active': {
        opacity: 1,
        color: `${palette.primary.main} !important`,
      },
    },
  }),
)

export default SidebarMenu
