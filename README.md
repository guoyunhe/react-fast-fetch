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

const fetcher = (url) => axios.get(url).then((res) => res.data);

const store = new IndexedDBStore({ limit: 10000 });

function App() {
  return (
    <FetchConfigProvider fetcher={fetcher} store={store}>
      <Posts />
    </FetchConfigProvider>
  );
}

function Posts() {
  const { data, loading } = useFetch('/posts?query=hello');
  return (
    <div>
      {loading && <span>Loading...</span>}
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## Config

Here are two ways to configure react-fast-fetch.

```jsx
// Use global config, recommended
<FetchConfigProvider fetcher={fetcher} store={store}>
  ...
</FetchConfigProvider>;

// Use local config, for flexibility
const { data } = useFetch('/url', { fetcher: customFetcher, store: customStore });
```

Both ways supports the following configuration:

### fetcher

Fetch remote API data. This prop allows you to use different HTTP client libraries.

Fetch API:

```jsx
const fetcher = (url: string) => fetch(url).then((res) => res.json());
```

Axios:

```jsx
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
```

### store

Cache data in various storage. There are two built-in stores:

'''MemoryStore''' saves data in a Map object. The cache is NOT persist, which means you will lose these cache after refreshing or closing the browser tab. Your next visit to the React app will not be speeded up. Modern devices are capable to store several GB of data in memory. However, you can set a limit to reduce memory usage.

```js
const store = new MemoryStore({ limit: 10000 });
```

'''IndexedDBStore''' saves data in IndexedDB, and with memory cache for faster access. The cache is persist and your app will speed up on next visit. IndexedDB can store as many data as available space on your disk. However, you should set a reasonable limit to reduce disk space usage. Keep in mind that IndexedDB won't work in private browsing and some webviews that doesn't support IndexedDB.

```js
const store = new IndexedDBStore({ dbName: 'my_app_fetch_data', limit: 10000 });
```

## Options

### disabled

Disable data fetching. This is useful when some parameters is required to fetch data.

```js
const [page, setPage] = useState(1);
const { data } = useFetch(`/posts?page=${page}`, { disabled: page < 1 });
```

### onLoad

Callback when the intial load is done.

```js
const [page, setPage] = useState(1);
const { data } = useFetch(`/posts?page=${page}`, {
  onLoad: (url, data) => {
    console.log(url, data);
  },
});
```

### onReload

Callback when data is reloaded.

```js
const [page, setPage] = useState(1);
const { data } = useFetch(`/posts?page=${page}`, {
  onReload: (url, data) => {
    console.log(url, data);
  },
});
```
