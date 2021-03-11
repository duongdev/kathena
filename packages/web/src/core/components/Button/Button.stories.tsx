import { Fragment } from 'react'

import { Grid } from '@material-ui/core'
import { Meta, Story } from '@storybook/react/types-6-0'
import { Star } from 'phosphor-react'

import Typography from '../Typography'

import Button, { ButtonProps } from './Button'

export default {
  title: 'components/Button',
  component: Button,
} as Meta

const sizes: ButtonProps['size'][] = ['small', 'medium', 'large']

const Template: Story<ButtonProps> = (args) => {
  return (
    <Grid container spacing={4}>
      {sizes.map((size) => (
        <Fragment key={size}>
          <Typography gridItem={{ xs: 12 }} variant="body2">
            {size?.toUpperCase()}
          </Typography>
          <Button gridItem size={size} color="inherit" {...args}>
            Inherit
          </Button>
          <Button
            gridItem
            size={size}
            color="primary"
            variant="contained"
            {...args}
          >
            Primary
          </Button>
          <Button gridItem size={size} color="secondary" {...args}>
            Secondary
          </Button>
          <Button gridItem size={size} color="primary" loading {...args}>
            Loading
          </Button>
          <Button gridItem size={size} color="primary" disabled {...args}>
            Disabled
          </Button>
          <Button
            gridItem
            size={size}
            color="primary"
            startIcon={<Star />}
            {...args}
          >
            WithIcon
          </Button>
          <Button
            gridItem
            size={size}
            color="secondary"
            startIcon={<Star />}
            {...args}
          >
            WithIcon
          </Button>
          <Grid item>
            <Button gridItem size={size} color="secondary" iconOnly {...args}>
              <Star />
            </Button>
          </Grid>
        </Fragment>
      ))}
    </Grid>
  )
}

export const TextButton = Template.bind({})
TextButton.args = { variant: 'text' }

export const ContainedButton = Template.bind({})
ContainedButton.args = { variant: 'contained' }

export const OutlinedButton = Template.bind({})
OutlinedButton.args = { variant: 'outlined' }
