import { renderEventGrid } from './event-grid';

import './event-grid.scss';

export default {
  title: 'Components/Event Grid',
  parameters: {
    backgrounds: {
      default: 'Call to Action',
    },
  },
};

export const EventGrid = () => renderEventGrid();
