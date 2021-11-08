import './icon.scss';

type Icon = 'clock' | 'quote' | 'waves';

export function renderIcon(icon: Icon) {
  switch (icon) {
    case 'clock':
      return `
        <svg class="icon" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 16">
          <path d="M7.5 1c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7Zm0 1.167A5.824 5.824 0 0 1 13.333 8 5.824 5.824 0 0 1 7.5 13.833 5.824 5.824 0 0 1 1.667 8 5.824 5.824 0 0 1 7.5 2.167Zm-.583 1.166v5.25H11V7.417H8.083V3.333H6.917Z" fill="currentColor" fill-rule="nonzero" stroke="currentColor" stroke-width=".5"/>
        </svg>
      `;

    case 'quote':
      return `
      <svg class="icon" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 40">
        <path d="M12.69 0C3.102 3.668.5 7.335.5 17.192v16.734h17.396V17.192h-9.94c.118-7.106 1.775-9.17 8.993-11.118L12.69 0Zm23.904 0c-9.586 3.668-12.19 7.335-12.19 17.192v16.734h17.397V17.192h-9.94c.118-7.106 1.774-9.17 8.993-11.118L36.594 0Z" fill="#010965" fill-rule="nonzero"/>
      </svg>
      `;

    case 'waves':
      return `
        <svg class="icon" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 123 40">
          <path d="m47.87 22.126 2.157 2.895c7.193 9.653 17.113 9.64 25.122.186l.245-.292 2.052-2.485 2.077 2.464c3.565 4.23 7.962 6.694 12.517 7.094l.39.03 2.693.166-.33 5.43-2.693-.167c-5.235-.324-10.228-2.646-14.408-6.608l-.194-.186-.16.161c-9.123 9.06-20.672 9.267-29.278.262l-.19-.202-.19.202c-8.605 9.005-20.155 8.798-29.278-.262l-.16-.162-.193.187c-4.067 3.855-8.904 6.158-13.984 6.578l-.424.03-2.693.167-.33-5.43 2.692-.167c4.563-.282 8.988-2.636 12.6-6.765l.308-.358 2.077-2.464 2.052 2.485c7.97 9.647 17.898 9.855 25.145.399l.221-.293 2.157-2.895Zm0-21.655 2.157 2.895c7.193 9.653 17.113 9.64 25.122.186l.245-.293L77.446.775l2.077 2.464c3.565 4.23 7.962 6.694 12.517 7.094l.39.03 2.693.166-.33 5.43-2.693-.167c-5.235-.324-10.228-2.646-14.408-6.608l-.194-.187-.16.162c-9.123 9.06-20.672 9.267-29.278.262l-.19-.202-.19.202c-8.605 9.005-20.155 8.798-29.278-.262l-.16-.162-.193.187c-4.067 3.855-8.904 6.157-13.984 6.577l-.424.031-2.693.167-.33-5.43 2.692-.167c4.563-.282 8.988-2.636 12.6-6.765l.308-.358L18.295.775l2.052 2.484c7.97 9.648 17.898 9.855 25.145.4l.221-.293L47.87.471Z" fill="#A6A8D2" fill-rule="nonzero"/>
        </svg>
      `;

    default:
      return '';
  }
}