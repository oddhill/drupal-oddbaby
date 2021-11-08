import classNames from 'classnames';

import './page-section.scss';

interface Args {
  contained?: boolean;
  content: string;
  title?: string;
  icon?: string;
}

function renderHeader(args: {
  icon: string | undefined;
  title: string | undefined;
}): string {
  if (args.title === undefined) {
    return '';
  }

  let icon = '';

  if (args.icon) {
    icon = /* html */ `
      <div class="page-section__icon">
        ${args.icon}
      </div>
    `;
  }

  return /* html */ `
    <div class="page-section__header">
      ${icon}

      <div class="page-section__title">
        ${args.title}
      </div>
    </div>
  `;
}

export function renderPageSection(args: Args): string {
  const pageSectionClass = classNames('page-section', {
    'page-section--contained': args.contained,
  });

  const title = renderHeader({ title: args.title, icon: args.icon });

  return `
    <div class="${pageSectionClass}">
      ${title}

      <div class="page-section__content">
        ${args.content}
      </div>
    </div>
  `;
}
