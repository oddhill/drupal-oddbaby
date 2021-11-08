import { renderButtonLink } from '../../components/button/button';

import logo from './logo.svg';

import './page-header.scss';

export function renderPageHeader(): string {
  const button = renderButtonLink({
    content: 'Bli Medlem',
    variant: 'menu',
    href: '#',
  });

  return `
    <header class="page-header">
      <div class="page-header__content">
        <img class="page-header__logo" src="${logo}" />

        <div class="page-header__menu">
          <nav class="page-header__navigation">
            <a class="page-header__navigation-item" href="#">Kalender</a>
            <a class="page-header__navigation-item" href="#">Om Klubben</a>
            <a class="page-header__navigation-item" href="#">Kontakta Oss</a>
          </nav>

          <div class="page-header__action">
            ${button}
          </div>
        </div>
      </div>
    </header>
  `;
}
