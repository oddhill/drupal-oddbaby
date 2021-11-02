const DrupalAttribute = require('drupal-attribute');
const path = require('path');
const Twig = require('twig');

Twig.cache(false);

Twig.extendFunction('create_attribute', (args) => {
  let values = [];

  if (typeof args === 'object') {
    values = Object.entries(args);
  }

  return new DrupalAttribute(values);
});

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    values: [
      {
        name: 'Blue',
        value: '#131F82',
      },
      {
        name: 'Call to Action',
        value: '#070A2C',
      },
    ],
  },
};
