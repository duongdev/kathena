/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { FC, ReactNode, useCallback, useState } from 'react'

import {
  FormControl,
  makeStyles,
  MenuItem,
  Select as MuiSelect,
  FormHelperText,
  SelectProps as MuiSelectProps,
  Theme,
} from '@material-ui/core'
import clsx from 'clsx'

import { withGridItem } from '../GridItemContainer'
import Typography from '../Typography'

export interface SelectProps extends MuiSelectProps {
  classes?: Partial<Record<string, string>>
  className?: string
  fullWidth?: boolean
  label?: string
  value?: string | number | null
  options: { label: ReactNode; value: string | number }[]
  helperText?: ReactNode
  disablePortal?: boolean
}

const Select: FC<SelectProps> = (props) => {
  const classes = useStyles(props)
  const {
    classes: _classes,
    className,
    fullWidth,
    label,
    options,
    onFocus,
    onBlur,
    error,
    placeholder,
    value,
    helperText,
    disablePortal,
    ...rest
  } = props
  const [isFocused, setFocus] = useState(false)

  const handleFocus = useCallback(
    (event) => {
      setFocus(true)
      if (onFocus) {
        onFocus(event)
      }
    },
    [onFocus],
  )
  const handleBlur = useCallback(
    (event) => {
      setFocus(false)
      if (onBlur) {
        onBlur(event)
      }
    },
    [onBlur],
  )

  return (
    <FormControl
      fullWidth={fullWidth}
      className={clsx(classes.root, className)}
    >
      {label && (
        <Typography
          variant="body2"
          color="textSecondary"
          classes={{
            root: clsx(classes.label, { isFocused, error }),
          }}
        >
          {label}
        </Typography>
      )}
      <MuiSelect
        disableUnderline
        MenuProps={{ disablePortal }}
        fullWidth={fullWidth}
        classes={{
          root: classes.selectRoot,
          select: clsx(classes.selectSelect, { error }),
          icon: classes.selectIcon,
          disabled: classes.selectDisabled,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        displayEmpty
        value={value || ''}
        {...rest}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((op) => (
          <MenuItem key={op.value} value={op.value}>
            {op.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && (
        <FormHelperText error={error}>{helperText}</FormHelperText>
      )}
    </FormControl>
  )
}

Select.defaultProps = {
  fullWidth: false,
}

const useStyles = makeStyles<Theme, SelectProps>(
  ({ shadows, palette, shape, spacing, typography, transitions }) => ({
    root: {},
    label: {
      marginBottom: spacing(0.5),
      fontFamily: typography.h1.fontFamily,
      transition: transitions.create('color', {
        duration: transitions.duration.short,
        easing: transitions.easing.easeInOut,
      }),

      '&.isFocused': {
        color: palette.primary.main,
      },
      '&.error': {
        color: palette.error.main,
      },
    },
    selectRoot: {
      backgroundColor: palette.background.dark,
    },
    selectSelect: {
      padding: spacing(1.25, 4, 1.375, 2),
      borderRadius: shape.borderRadius,
      overflow: 'hidden',
      border: `2px solid ${palette.background.dark}`,

      transition: transitions.create(['border-color', 'box-shadow'], {
        duration: transitions.duration.short,
        easing: transitions.easing.easeInOut,
      }),

      '&:focus': {
        borderRadius: shape.borderRadius,
        borderColor: palette.primary.main,
        boxShadow: shadows[1],
      },

      '&.error': {
        borderColor: palette.error.main,
      },
    },
    selectDisabled: {
      backgroundColor: palette.action.disabledBackground,
    },
    selectIcon: {
      right: spacing(0.75),
    },
  }),
)

export default withGridItem(Select)
