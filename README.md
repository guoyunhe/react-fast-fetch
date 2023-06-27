# react-fast-fetch

Fetch and cache remote data in React apps. Make your app load faster.

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
npm i react-fast-fetch
```

## Usage

```jsx
import { FetchConfigProvider, IndexedDBStore, useFetch } from 'react-fast-fetch';
import axios from 'axios';

const fetcher = url => axios.get(url).then(res => res.data);

const store = new IndexedDBStore({ limit: 10000 });

function App() {
  return (
    <FetchConfigProvider fetcher={fetcher} store={store}>
      <Posts/>
    </FetchConfigProvider>
  );
}

function Posts {
  const { data, loading } = useFetch('/posts?query=hello');
  return (
    <div>
      {loading && <span>Loading...</span>}
      {data?.map(post => <div key={post.id}>{post.title}</div>)}
    <div>
  );
}
```
