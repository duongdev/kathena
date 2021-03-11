import { Meta, Story } from '@storybook/react/types-6-0'

import Spinner, { SpinnerProps } from './Spinner'

export default {
  title: 'components/Spinner',
  component: Spinner,
} as Meta

const Template: Story<SpinnerProps> = (args) => <Spinner {...args} />

export const CircularDefault = Template.bind({})
