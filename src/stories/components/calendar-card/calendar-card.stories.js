import { renderCalendarCard } from './calendar-card';

import './calendar-card.scss';

export default {
  title: 'Components/Calendar Card',
  argTypes: {
    date: {
      control: { type: 'date' },
    },
  },
  parameters: {
    backgrounds: {
      default: 'Blue',
    },
  },
};

const Template = (args) => renderCalendarCard(args);

export const CalendarCard = Template.bind({});

CalendarCard.args = {
  color: '#FFD078',
  date: new Date(),
  location: 'Malmö',
  title: 'Sup race',
  description: 'En del av Svenska Sup Race Serien',
  tag: 'Tävling',
};
