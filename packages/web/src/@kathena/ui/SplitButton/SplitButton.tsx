/* eslint-disable react/jsx-props-no-spreading */
import React, { FC, useRef, useState } from 'react'

import {
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@material-ui/core'
import { CaretDown } from 'phosphor-react'

import Button, { ButtonProps } from '../Button'
import withComponentHocs from '../hocs/withComponentHocs'

export type SplitButtonProps = {
  items: ButtonProps[]
  variant?: 'contained' | 'outlined' | 'text'
}

const SplitButton: FC<SplitButtonProps> = (props) => {
  const { variant, items } = props
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
      >
        <Button {...items[selectedIndex]} />
        <Button
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

export default withComponentHocs(SplitButton)
