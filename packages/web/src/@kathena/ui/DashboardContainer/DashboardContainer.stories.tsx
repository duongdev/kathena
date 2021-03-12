import { Meta, Story } from '@storybook/react/types-6-0'
import { Gauge } from 'phosphor-react'

import SidebarMenu from '../SidebarMenu'

import DashboardContainer, {
  DashboardContainerProps,
} from './DashboardContainer'

export default {
  title: 'containers/DashboardContainer',
  component: DashboardContainer,
} as Meta

const Template: Story<DashboardContainerProps> = (args) => (
  <DashboardContainer
    {...args}
    sidebar={
      <SidebarMenu
        menus={[
          {
            title: 'Dashboard',
            icon: Gauge,
            key: 'dashboard',
            items: [
              {
                key: 'courses',
                label: 'My courses',
              },
              {
                key: 'stats',
                label: 'My stats',
              },
            ],
          },
        ]}
      />
    }
  >
    Dashboard content
  </DashboardContainer>
)

export const Basic = Template.bind({})
