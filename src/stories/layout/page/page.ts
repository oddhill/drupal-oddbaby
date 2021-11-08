import { renderPageFooter } from '../page-footer/page-footer';
import { renderPageHeader } from '../page-header/page-header';

import './page.scss';

interface Args {
  content: string;
  hero?: string;
}

function renderPageHero(hero: string | undefined): string {
  if (hero === undefined) {
    return '';
  }

  return /* html */ `
    <div class="page__hero">
      ${hero}
    </div>
  `;
}

export function renderPage({ content, hero }: Args): string {
  const renderedHeader = renderPageHeader();
  const renderedFooter = renderPageFooter();
  const renderedHero = renderPageHero(hero);

  return `
    <div class="page">
      ${renderedHeader}
      ${renderedHero}

      <div class="page__content">
        ${content}
      </div>

      ${renderedFooter}
    </dib>
  `;
}
