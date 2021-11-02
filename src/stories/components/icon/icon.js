export function renderIcon(icon) {
  switch (icon) {
    case 'clock':
      return `
        <svg class="icon" width="15" height="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 1c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7Zm0 1.167A5.824 5.824 0 0 1 13.333 8 5.824 5.824 0 0 1 7.5 13.833 5.824 5.824 0 0 1 1.667 8 5.824 5.824 0 0 1 7.5 2.167Zm-.583 1.166v5.25H11V7.417H8.083V3.333H6.917Z" fill="currentColor" fill-rule="nonzero" stroke="currentColor" stroke-width=".5"/>
        </svg>
      `;

    default:
      return '';
  }
}
