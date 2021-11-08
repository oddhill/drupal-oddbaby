import { renderPageFooter } from './page-footer';

export default {
  title: 'Layout/Page Footer',
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = () => renderPageFooter();

export const PageFooter = Template.bind({});
