import { renderHero } from './hero';
import { renderButtonLink } from '../button/button';

import image from './hero-image-square.jpg';

export default {
  title: 'Components/Hero',
  parameters: {
    backgrounds: {
      default: 'Background',
    },
  },
};

const Template = (args) => renderHero(args);

export const Hero = Template.bind({});

Hero.args = {
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
};
