import './legible.scss';

interface Args {
  content: string;
}

export function renderLegible(args: Args): string {
  return `
    <div class="legible">
      ${args.content}
    </div>
  `;
}
