import { Grid } from '@material-ui/core'
import { Meta, Story } from '@storybook/react/types-6-0'

import InfoBlock, { InfoBlockProps } from './InfoBlock'

export default {
  title: 'components/InfoBlock',
  component: InfoBlock,
} as Meta

const Template: Story<InfoBlockProps> = (args) => (
  <Grid container spacing={4}>
    <InfoBlock gridItem {...args} />
  </Grid>
)

export const Basic = Template.bind({})
Basic.args = { label: 'Tên người dùng', children: 'Minh Nhật' }
