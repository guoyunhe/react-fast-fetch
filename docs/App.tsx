import { deleteDB } from 'idb';
import { DocCodeBlock, DocContainer, DocDemoBlock, DocHeader, DocHeading } from 'react-doc-ui';
import { IndexedDBStore } from '../src/stores/IndexedDBStore';
import Demo from './Demo';
import demoCode from './Demo.tsx?raw';

const store = new IndexedDBStore();
store.set('/foo', { foo: 'bar' });
export default function App() {
  return (
    <DocContainer>
      <DocHeader title={PACKAGE_NAME + '@' + PACKAGE_VERSION} />
      <p>Please edit "docs/App.tsx"...</p>

      <DocHeading>Install</DocHeading>
      <DocCodeBlock language="bash" code={`npm i ${PACKAGE_NAME}`} />

      <DocHeading>Usage</DocHeading>
      <button onClick={() => deleteDB('react_fetch')}>Delete IndexedDB</button>
      <DocDemoBlock>
        <Demo />
      </DocDemoBlock>
      <DocCodeBlock language="jsx" code={demoCode} />
    </DocContainer>
  );
}
