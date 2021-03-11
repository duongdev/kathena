import { Box } from '@material-ui/core'
import { Meta, Story } from '@storybook/react/types-6-0'

import Typography, { TypographyProps } from './index'

export default {
  title: 'components/Typography',
  component: Typography,
  args: { display: 'block' },
} as Meta

const Template: Story<TypographyProps> = (args) => (
  <Box>
    <Typography variant="h1" gutterBottom {...args}>
      h1. Heading
    </Typography>
    <Typography variant="h2" gutterBottom {...args}>
      h2. Heading
    </Typography>
    <Typography variant="h3" gutterBottom {...args}>
      h3. Heading
    </Typography>
    <Typography variant="h4" gutterBottom {...args}>
      h4. Heading
    </Typography>
    <Typography variant="h5" gutterBottom {...args}>
      h5. Heading
    </Typography>
    <Typography variant="h6" gutterBottom {...args}>
      h6. Heading
    </Typography>
    <Typography variant="subtitle1" gutterBottom {...args}>
      subtitle1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
      blanditiis tenetur
    </Typography>
    <Typography variant="subtitle2" gutterBottom {...args}>
      subtitle2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
      blanditiis tenetur
    </Typography>
    <Typography variant="body1" gutterBottom {...args}>
      body1. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
      blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
      neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
      Eum quasi quidem quibusdam.
    </Typography>
    <Typography variant="body2" gutterBottom {...args}>
      body2. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos
      blanditiis tenetur unde suscipit, quam beatae rerum inventore consectetur,
      neque doloribus, cupiditate numquam dignissimos laborum fugiat deleniti?
      Eum quasi quidem quibusdam.
    </Typography>
    <Typography variant="button" display="block" gutterBottom {...args}>
      button text
    </Typography>
    <Typography variant="caption" display="block" gutterBottom {...args}>
      caption text
    </Typography>
    <Typography variant="overline" display="block" gutterBottom {...args}>
      overline text
    </Typography>
  </Box>
)

export const AllVariantsDemo = Template.bind({})
