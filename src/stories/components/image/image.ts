import classNames from 'classnames';

import './image.scss';

interface Args {
  alt: string;
  src: string;
  rounded?: boolean;
}

export function renderImage({ alt, src, rounded }: Args): string {
  const imageClass = classNames('image', {
    'image--rounded': rounded,
  });

  return /* html */ `
    <img src="${src}" alt="${src}" class="${imageClass}">
  `;
}
