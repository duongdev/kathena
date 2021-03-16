import { Grid } from '@material-ui/core'
import { Meta, Story } from '@storybook/react/types-6-0'

import Alert, { AlertProps } from './Alert'

export default {
  title: 'components/Alert',
  component: Alert,
} as Meta

const Template: Story<AlertProps> = (args) => (
  <Grid container spacing={2}>
    <Alert gridItem={{ xs: 12, md: 8 }} severity="info" {...args}>
      Alert content
    </Alert>
    <Alert gridItem={{ xs: 12, md: 8 }} severity="success" {...args}>
      Alert content
    </Alert>
    <Alert gridItem={{ xs: 12, md: 8 }} severity="warning" {...args}>
      Alert content
    </Alert>
    <Alert gridItem={{ xs: 12, md: 8 }} severity="error" {...args}>
      Alert content
    </Alert>
  </Grid>
)

export const Basic = Template.bind({})
