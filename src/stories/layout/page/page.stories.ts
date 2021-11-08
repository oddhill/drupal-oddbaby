import { renderLegible } from '../../components/legible/legible';
import { renderPageSection } from '../page-section/page-section';

import { renderPage } from './page';

export default {
  title: 'Layout/Page',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Page = () => {
  const content = renderPageSection({
    contained: true,
    content: renderLegible({
      content: `
        <h1>Suspendisse elit ligula</h1>
        <p class="preamble">Nullam quis risus eget urna mollis ornare vel eu leo. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras euismod euismod cursus. Integer id lacinia erat. Quisque finibus dui nec purus venenatis, nec dapibus mi euismod. Duis ante lorem, lacinia vitae aliquam quis, sagittis sit amet odio. Proin posuere aliquam eleifend. Donec suscipit leo porta velit tristique gravida. Donec et tincidunt mauris, in interdum quam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam augue turpis, tempus et interdum ut, tincidunt at felis. Curabitur id ante urna. Nulla nec finibus orci. Proin condimentum, sem mollis lobortis maximus, nulla sem molestie tellus, a accumsan enim nunc a est.</p>
        <h2>Behöver du hyra bräda?</h2>
        <p>Vivamus cursus, tellus id lobortis volutpat, libero orci placerat ipsum, at cursus velit elit et dolor. Pellentesque vel tortor tincidunt, sollicitudin nisi facilisis, mollis ex. Donec tortor nibh, fringilla vitae molestie nec, fringilla nec lacus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Mauris erat elit, ultrices non eleifend sit amet, vestibulum sit amet eros. Pellentesque aliquam vel est id cursus. Etiam sed pretium ligula, non mollis nibh. In semper odio eu sollicitudin tincidunt. Pellentesque vehicula vitae risus in fermentum. Sed ac purus commodo risus laoreet rutrum vel id elit. Nam mattis massa at velit aliquet, id accumsan purus viverra. Curabitur rhoncus dignissim orci sodales imperdiet.</p>
        <p>Suspendisse elit ligula, mollis a aliquet ut, tincidunt quis orci. Donec mi mauris, interdum a arcu at, aliquam commodo sapien. Aliquam fermentum odio mauris, maximus tincidunt neque dictum eu. Praesent lacinia tellus sit amet pulvinar bibendum. Sed molestie volutpat facilisis. Suspendisse potenti. Donec tincidunt tortor orci, sit amet accumsan sem lobortis eu. Nulla scelerisque velit augue, a euismod enim lobortis a. Mauris lacinia consequat metus, sit amet pulvinar ligula commodo ut. Aenean volutpat nisl quis eros viverra accumsan. Sed pretium sem quis sollicitudin congue. Integer tincidunt risus nunc, non fermentum tellus lacinia consequat. Duis elementum massa ante, nec convallis neque ultrices sit amet. Donec gravida risus eget purus pulvinar cursus.</p>
        <p>Praesent ut imperdiet metus, rutrum vulputate nisi. Suspendisse aliquam tellus sit amet dolor scelerisque, at laoreet dolor maximus. Nullam tempor dolor enim, eget lacinia risus pellentesque eget. Duis a ligula viverra, molestie nisl non, congue nunc. Etiam at ornare mauris, a mattis tellus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum maximus sapien quam, et pretium nisl finibus ac. Morbi varius urna ut enim dignissim tincidunt. Maecenas vitae viverra nulla.</p>
        <p>Proin pulvinar, augue in aliquet pretium, sem diam cursus tellus, vel ullamcorper risus dui a arcu. Morbi commodo, sapien eget condimentum accumsan, nibh orci eleifend felis, id convallis dolor ex vitae dolor. Donec est lectus, volutpat at enim et, suscipit tincidunt sapien. Curabitur in ante urna. Phasellus viverra aliquam bibendum. Donec sed ligula at orci interdum vulputate quis id sem. Nunc non sagittis augue. Proin vestibulum lobortis elit, quis consectetur nunc semper ac. Aliquam iaculis mi ligula, et posuere neque pharetra et. Praesent eget ante velit. Pellentesque consectetur vulputate euismod. Nam ultrices, sapien sit amet mollis gravida, justo libero volutpat nisl, id iaculis lacus leo quis magna. Vivamus vel nisi ligula.</p>
      `,
    }),
  });

  return renderPage({ content });
};
