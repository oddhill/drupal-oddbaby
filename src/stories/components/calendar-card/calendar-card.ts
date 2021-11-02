import formatDate from 'date-fns/format';

import { renderEventColor } from '../event-color';
import { renderIcon } from '../icon';

import type { Event } from '../../data';

/**
 * Render the event tag.
 *
 * @param {string} color
 * @param {string|undefined} tag
 *
 * @returns string
 */
function renderTag(color, tag) {
  if (tag === undefined) {
    return '';
  }

  const eventColor = renderEventColor(color);

  return `
    <div class="calendar-card__item">
      <div class="calendar-card__item-graphic">${eventColor}</div>
      <div class="calendar-card__item-text">#${tag}</div>
    </div>
  `;
}

/**
 * Render a calendar card.
 */
export function renderCalendarCard(event: Event): string {
  const { color, date, location, title, description, tag } = event;

  const clockIcon = renderIcon('clock');
  const tagItem = renderTag(color, tag);

  return `
    <a href="#" class="calendar-card" style="border-left-color: ${color}">
      <div class="calendar-card__date">
        <div class="calendar-card__weekday">
          ${formatDate(date, 'EEE')}
        </div>

        <div class="calendar-card__day">
          ${formatDate(date, 'd')}
        </div>

        <div class="calendar-card__month">
          ${formatDate(date, 'MMM')}
        </div>
      </div>

      <div class="calendar-card__content">
        <div class="calendar-card__header">
          ${tagItem}

          <div class="calendar-card__item">
            <div class="calendar-card__item-graphic">${clockIcon}</div>
            <div class="calendar-card__item-text">
              ${formatDate(date, 'HH:mm')}
            </div>
          </div>

          <div class="calendar-card__item">
            <div class="calendar-card__item-graphic">${clockIcon}</div>
            <div class="calendar-card__item-text">${location}</div>
          </div>
        </div>

        <div class="calendar-card__title">
          ${title}
        </div>

        <div class="calendar-card__description">
          ${description}
        </div>
      </div>
    </a>
  `;
}
