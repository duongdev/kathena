import { FC } from 'react'

import { makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import { Route } from 'react-router-dom'

import { ANY } from '@kathena/types'
import { Link, withComponentHocs } from '@kathena/ui'

export type TabMenuProps = {
  items: {
    title: string
    to: string
    exact: boolean
  }[]
}

const TabMenu: FC<TabMenuProps> = (props) => {
  const { items } = props
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {items.map((item) => (
        <CustomLink title={item.title} to={item.to} exact={item.exact} />
      ))}
    </div>
  )
}

const CustomLink = ({ title, to, exact }: ANY) => {
  const classes = useStyles()
  return (
    <Route path={to} exact={exact}>
      {({ match }) => (
        <Link
          className={clsx(classes.item, { [classes.active]: match })}
          to={to}
        >
          {title}
        </Link>
      )}
    </Route>
  )
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    marginBottom: '30px',
  },
  item: {
    padding: '10px 20px',
    color: '#000',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  active: {
    borderBottom: '2px solid #000',
  },
})

export default withComponentHocs(TabMenu)
