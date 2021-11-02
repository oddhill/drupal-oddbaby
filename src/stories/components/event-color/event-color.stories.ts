import { renderEventColor } from './event-color';

export default {
  title: 'Components/Event Color',
};

const Template = ({ color }) => renderEventColor(color);

export const EventColor = Template.bind({});

EventColor.args = {
  color: '#FFD078',
};
