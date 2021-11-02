import formatDate from 'date-fns/format';

import { renderCalendarCard } from '../calendar-card';
import type { Event } from '../../data';

import './calendar-list.scss';

type EventGroups = Map<string, Event[]>;

function groupEvents(events: Event[]): EventGroups {
  const groups: EventGroups = new Map();

  for (const event of events) {
    const year = formatDate(event.date, 'yyyy');

    if (groups.has(year) === false) {
      groups.set(year, []);
    }

    const yearGroup = groups.get(year);
    yearGroup.push(event);

    groups.set(year, yearGroup);
  }

  return groups;
}

function renderGroups(groups: EventGroups): string {
  let result = '';

  for (const [year, events] of groups) {
    const items = events.map((event) => renderCalendarCard(event));

    result += `
        <div class="calendar-list__group">
          <div class="calendar-list__title">${year}</div>

          <div class="calendar-list__items">
            ${items.join('')}
          </div>
        </div>
      `;
  }

  return result;
}

export function renderCalendarList(events: Event[]): string {
  const groupedEvents = groupEvents(events);
  const renderedGroups = renderGroups(groupedEvents);

  return `
    <div class="calendar-list">
      ${renderedGroups}
    </div>
  `;
}
