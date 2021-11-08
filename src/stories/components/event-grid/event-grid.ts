import eventCard from '../event-card/event-card.html.twig';
import eventGrid from './event-grid.html.twig';

import { events } from '../../data';
import image from './event-image-small.jpg';

import './event-grid.scss';
import { renderImage } from '../image/image';

export function renderEventGrid(): string {
  const renderedEvents: string[] = [];

  for (const event of events.slice(0, 4)) {
    renderedEvents.push(
      eventCard({
        url: '#',
        title: event.title,
        text: event.description,
        date: event.date,
        image: renderImage({
          alt: event.title,
          src: image,
          rounded: true,
        }),
      }),
    );
  }

  return eventGrid({
    content: renderedEvents.join(''),
  });
}
