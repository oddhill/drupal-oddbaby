import { events } from '../../data';

import { renderCalendarList } from './calendar-list';

export default {
  title: 'Components/Calendar List',
  parameters: {
    backgrounds: {
      default: 'Blue',
    },
  },
};

const Template = () => renderCalendarList(events);

export const CalendarList = Template.bind({});
