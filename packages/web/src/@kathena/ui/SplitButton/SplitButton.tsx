/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useRef, useState } from 'react'

import {
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  makeStyles,
  Popper,
} from '@material-ui/core'
import { CaretDown } from 'phosphor-react'

import Button, { ButtonProps } from '../Button'
import withComponentHocs from '../hocs/withComponentHocs'

export type SplitButtonProps = {
  items: ButtonProps[]
  variant?: 'contained' | 'outlined' | 'text'
  disable?: boolean
  backgroundButton?: 'default' | 'primary'
}

const SplitButton: FC<SplitButtonProps> = (props) => {
  const classes = useStyles(props)

  const { variant, items, disable, backgroundButton } = props
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index)
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
      <ButtonGroup
        variant={variant ?? 'contained'}
        ref={anchorRef}
        aria-label="split button"
        disabled={disable}
      >
        <Button
          {...items[selectedIndex]}
          className={
            backgroundButton === 'primary'
              ? classes.backgroundColorSplitButton
              : classes.root
          }
        />
        <Button
          className={
            backgroundButton === 'primary'
              ? classes.backgroundColorSplitButton
              : classes.root
          }
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <CaretDown size={24} />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        style={{ zIndex: 1000 }}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
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
                <MenuList id="split-button-menu">
                  {items.map((item, index) => (
                    <MenuItem
                      // eslint-disable-next-line
                      key={index}
                      disabled={item.disabled}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {item.children}
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
  backgroundColorSplitButton: {
    backgroundColor: '#fcbf16',
    borderColor: '#fff !important',
  },
}))
export default withComponentHocs(SplitButton)
