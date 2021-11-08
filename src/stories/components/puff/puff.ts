import classNames from 'classnames';

import './puff.scss';

interface Args {
  variant?: 'salmon' | 'seashell';
  media: string;
  icon: string;
  text: string;
  subTitle: string;
  subText: string;
}

export function renderPuff(args: Args): string {
  const puffClass = classNames('puff', {
    [`puff--${args.variant}`]: args.variant,
  });

  return /* html */ `
    <div class="${puffClass}">
      <div class="puff__inner">
        <div class="puff__media">
          ${args.media}
        </div>

        <div class="puff__content">
          <div class="puff__icon">
            ${args.icon}
          </div>

          <div class="puff__text">
            ${args.text}
          </div>

          <div class="puff__subtitle">${args.subTitle}</div>
          <div class="puff__subtext">${args.subText}</div>
        </div>
      </div>
    </div>
  `;
}
