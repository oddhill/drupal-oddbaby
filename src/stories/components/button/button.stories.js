import render from './button.html.twig';
import './button.scss';

export default {
  title: 'Components/Button',
  argTypes: {
    content: {
      control: { type: 'text' },
    },
    variant: {
      options: ['primary', 'secondary', 'white'],
      control: { type: 'select' },
    },
  },
};

const Template = (args) => render(args);

export const Primary = Template.bind({});

Primary.args = {
  content: 'Bli Medlem',
};

export const Secondary = Template.bind({});

Secondary.args = {
  content: 'Bli Medlem',
  variant: 'secondary',
};

export const White = Template.bind({});

White.args = {
  content: 'I am button',
  variant: 'white',
};

White.parameters = {
  backgrounds: {
    default: 'Call to Action',
  },
};
