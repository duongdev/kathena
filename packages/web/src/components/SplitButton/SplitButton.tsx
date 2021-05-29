/* eslint-disable react/jsx-props-no-spreading */
import { FC, useMemo } from 'react'
import * as React from 'react'

import { makeStyles } from '@material-ui/core'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'

import { SemanticColor } from '@kathena/theme'
import { StatusChip, StatusChipProps } from '@kathena/ui'
import { Publication } from 'graphql/generated'

const colorMap: { [p in Publication]: keyof SemanticColor } = {
  Draft: 'blue',
  Published: 'green',
}

export type SplitButtonProps = {
  publication: Publication
  variant?: StatusChipProps['variant']
  size?: StatusChipProps['size']
}
const options = [Publication.Draft, Publication.Published]

const SplitButton: FC<SplitButtonProps> = (props) => {
  const classes = useStyles(props)
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const { publication, variant, size } = props
  const color = useMemo(() => colorMap[publication], [publication])
  const handleMenuItemClick = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <ButtonGroup variant={variant} ref={anchorRef} aria-label="split button">
        <Button
          size={size}
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <StatusChip color={color} size={size}>
            {publication}
          </StatusChip>
        </Button>
      </ButtonGroup>
      <Popper
        color={color}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" className={classes.root}>
                  {options.map((option) => (
                    <MenuItem key={option} onClick={handleMenuItemClick}>
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

const useStyles = makeStyles(() => ({
  root: {},
}))

export default SplitButton
