import './button.scss';

type ButtonArgs = {
  content: string;
  variant?: 'menu' | 'secondary' | 'white';
};

type ButtonLinkArgs = ButtonArgs & {
  href: string;
};

function getButtonClass(variant: string = undefined): string {
  const classes = ['button', variant ? `button--${variant}` : ''];

  return classes.join(' ');
}

export function renderButton({ content, variant }: ButtonArgs): string {
  const classes = getButtonClass(variant);

  return `
    <button class="${classes}">
      ${content}
    </button>
  `;
}

export function renderButtonLink({
  content,
  href,
  variant,
}: ButtonLinkArgs): string {
  const classes = getButtonClass(variant);

  return `
    <a href="${href}" class="${classes}">
      ${content}
    </a>
  `;
}
