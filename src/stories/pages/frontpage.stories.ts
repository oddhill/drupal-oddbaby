import { renderEventGrid } from '../components/event-grid/event-grid';
import { renderHeroWithContent } from '../components/hero/hero';
import { renderIcon } from '../components/icon/icon';
import { renderPageSection } from '../layout/page-section/page-section';

import { renderPage } from '../layout/page/page';

export default {
  title: 'Pages/Frontpage',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Frontpage = () => {
  const eventsSection = renderPageSection({
    title: "What'Sup?",
    icon: renderIcon('waves'),
    content: renderEventGrid(),
    contained: true,
  });

  const heroSection = renderPageSection({
    content: renderHeroWithContent(),
    contained: true,
  });

  const sections = [heroSection, eventsSection];

  return renderPage({
    content: sections.join(''),
  });
};
