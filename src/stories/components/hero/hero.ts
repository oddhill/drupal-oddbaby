import { renderButtonLink } from '../button/button';
import { renderImage } from '../image/image';

import image from './hero-image-square.jpg';

import './hero.scss';

interface Args {
  title: string;
  text: string;
  actions: string;
  image: {
    alt: string;
    src: string;
  };
}

export function renderHero(args: Args): string {
  const renderedImage = renderImage({
    alt: args.image.alt,
    src: args.image.src,
    rounded: true,
  });

  return /* html */ `
    <div class="hero">
      <div class="hero__media">
        ${renderedImage}
      </div>

      <div class="hero__content">
        <div class="hero__title">${args.title}</div>
        <div class="hero__text">${args.text}</div>
        <div class="hero__actions">${args.actions}</div>
      </div>
    </div>
  `;
}

export function renderHeroWithContent(): string {
  return renderHero({
    title:
      'Valfritt att <span style="color: #eb6767">välja att ett ge en del av texten accentfärg</span>',
    text: 'Praesent ut imperdiet metus, rutrum vulputate nisi. Suspendisse aliquam tellus sit amet dolor scelerisque, at laoreet dolor maximus.',
    actions: [
      renderButtonLink({
        content: 'Bli Medlem',
        href: '#',
        variant: 'secondary',
      }),
      renderButtonLink({
        content: 'Läs om klubben',
        href: '#',
        variant: 'white',
      }),
    ].join(''),
    image: {
      alt: 'Some alt text',
      src: image,
    },
  });
}
