import './event-color.scss';

/**
 * @param {string} color
 */
export function renderEventColor(color) {
  return `
    <div class="event-color" style="background: ${color}"></div>
  `;
}
