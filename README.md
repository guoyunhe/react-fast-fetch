# react-fetch

Fetch and cache remote data in React apps.

HTTP client adaptors:

- fetch API
- axios

Browser cache adaptors:

- Memory (a `Map` object, not persist)
- IndexedDB (persist, almost no limit in size)

Why not localStorage?

- Both of them have 5MB size limit and can be easily filled up. Once the storage is full, any write access will throw errors and may break other functionalities that depend on localStorage.
- It is hard, if possible, to isolate cache from other important data, like auth tokens. Make cleaning and invalidating caches hard.

## Install

```bash
npm i @guoyunhe/react-fetch
```

## Usage

```jsx
import { FetchConfigProvider, IndexedDBStore, useFetch } from '@guoyunhe/react-fetch';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data)
const store = new IndexedDBStore({ limit: 10000 });

function App() {
  return <FetchConfigProvider fetcher={fetcher} store={store}>
    <Posts/>
  </FetchConfigProvider>;
}

function Posts {
  const { data } = useFetch('/posts?query=hello');
  return <div>
    {data?.map(post => <div key={post.id}>{post.title}</div>)}
  <div>;
}
```
