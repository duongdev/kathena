import { Box, Paper } from '@material-ui/core'
import { Meta, Story } from '@storybook/react/types-6-0'
import { Gauge } from 'phosphor-react'

import SidebarMenu, { SidebarMenuProps } from './SidebarMenu'

export default {
  title: 'components/SidebarMenu',
  component: SidebarMenu,
} as Meta

const Template: Story<SidebarMenuProps> = (args) => (
  <Box component={Paper} padding={2} width={256}>
    <SidebarMenu
      {...args}
      menus={[
        {
          title: 'Dashboard',
          icon: Gauge,
          key: 'dashboard',
          items: [
            {
              key: 'courses',
              label: 'My courses',
              active: true,
            },
            {
              key: 'stats',
              label: 'My stats',
              link: '/stats',
            },
          ],
        },
      ]}
    />
  </Box>
)

export const Basic = Template.bind({})
