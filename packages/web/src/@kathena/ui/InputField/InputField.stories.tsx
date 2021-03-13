import React from 'react'

import { Box, Grid, Paper } from '@material-ui/core'
import { Meta } from '@storybook/react/types-6-0'
import { Check } from 'phosphor-react'

import InputField from './InputField'

export default {
  title: 'components/InputField',
  component: InputField,
} as Meta

export const Text = () => (
  <Box component={Paper} m={1} p={3}>
    <Grid container spacing={2}>
      <InputField gridItem label="Input field" placeholder="Type something" />
      <InputField
        gridItem
        required
        label="Input field"
        placeholder="(required)"
      />
      <InputField
        gridItem
        label="Error"
        placeholder="Type something"
        color="error"
        helperText="Please try again"
      />
      <InputField
        gridItem
        label="Success"
        placeholder="Type something"
        color="success"
        helperText="Yeah succeeded!"
        endAdornment={<Check color="primary" />}
      />

      <InputField
        gridItem
        required
        label="Multiple"
        placeholder="(required)"
        rows={3}
        multiline
      />
    </Grid>
  </Box>
)

export const Currency = () => (
  <Box component={Paper} m={1} p={3}>
    <Grid container spacing={2}>
      <InputField variant="currency" label="Product price" />
    </Grid>
  </Box>
)

export const Quantity = () => (
  <Box component={Paper} m={1} p={3}>
    <Grid container spacing={2}>
      <InputField variant="quantity" />
    </Grid>
  </Box>
)
