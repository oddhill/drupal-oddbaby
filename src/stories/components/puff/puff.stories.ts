import { renderIcon } from '../icon/icon';
import { renderImage } from '../image/image';
import { renderPuff } from './puff';

import image from './puff-image-43.jpg';

export default {
  title: 'Components/Puff',
  parameters: {
    backgrounds: {
      default: 'Background',
    },
  },
  argTypes: {
    variant: {
      options: ['salmon', 'seashell'],
      control: { type: 'select' },
    },
    media: {
      table: {
        disable: true,
      },
    },
    icon: {
      table: {
        disable: true,
      },
    },
  },
};

const Template = (args) => renderPuff(args);

export const Puff = Template.bind({});

Puff.args = {
  variant: 'salmon',
  media: renderImage({ alt: 'Image', src: image, rounded: true }),
  icon: renderIcon('quote'),
  text: 'Det bästa med SUP är att det inte spelar  roll hur gammal eller ung du är, och man kan ta med sig hela familjen hit - alla kan lära sig.',
  subTitle: 'Lisa Åkerbom',
  subText: 'Beskrivning',
};
