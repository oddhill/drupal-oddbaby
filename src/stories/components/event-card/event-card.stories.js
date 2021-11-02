import render from './event-card.html.twig';
import image from './event-image_small.jpg';

import './event-card.scss';

export default {
  title: 'Components/Event Card',
  parameters: {
    backgrounds: {
      default: 'Call to Action',
    },
  },
};

const Template = (args) => render(args);

export const EventCard = Template.bind({});

EventCard.args = {
  url: 'https://www.google.se/',
  title: 'SM i 100 meter sprint',
  text: 'Lorem ipsum dolor sit amet, consectetur.',
  date: new Date(),
  image: {
    alt: 'Some image alt',
    src: image,
  },
};
