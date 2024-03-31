# React Fast Fetch

**React Fast Fetch** is a stale-while-revalidate implementation. It can fetch and cache remote data in React apps. Make your app load faster without writting more code. [Try this demo](https://codesandbox.io/s/sleepy-darkness-n6pkzd?file=/src/App.js)

## Get started

```bash
npm install --save react-fast-fetch
```

```jsx
import axios from 'axios';
import { FetchConfigProvider, IndexedDBStore, useFetch } from 'react-fast-fetch';

const fetcher = (url) => axios.get(url).then((res) => res.data);

const store = new IndexedDBStore({ limit: 10000 });

function App() {
  const { data, loading, reload, error } = useFetch('/posts', {
    params: {
      keyword: 'hello',
      page: 1,
      pageSize: 10,
    },
  });

  return (
    <div>
      {loading && <span>Loading...</span>}
      {error && (
        <span>
          Failed to fetch data <button onClick={reload}>Reload</button>
        </span>
      )}
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}

render(
  <FetchConfigProvider fetcher={fetcher} store={store}>
    <App />
  </FetchConfigProvider>,
);
```

## Choose a store

react-fast-fetch supports 4 types of storage:

| Store                         | Technology     | Persistence | Limit of size     | I/O Speed    |
| ----------------------------- | -------------- | ----------- | ----------------- | ------------ |
| MemoryStore                   | a Map object   | ❌          | your RAM capacity | < 1ms        |
| StorageStore (localStorage)   | localStorage   | ✅          | 5MB 😢            | < 1ms        |
| StorageStore (sessionStorage) | sessionStorage | ❌          | 5MB 😢            | < 1ms        |
| IndexedDBStore                | IndexedDB      | ✅          | your SSD capacity | 10~1000ms 😢 |

- If you want to persist your data and share between tabs:
  - For large site with many APIs and huge amount of data, use IndexedDBStore
  - For small site with only a few APIs, use StorageStore (localStorage)
- If you want to persist data between page refreshing and avoid sharing data between tabs, use StorageStore (sessionStorage)
- If you don't want to persist your data, use MemoryStore

You can also use multiple different store in the same app, if you know what you really need!

### MemoryStore

```js
import { MemoryStore } from 'react-fast-fetch';

export const store = new MemoryStore({
  // maximum 2000 url to cache
  limit: 2000,
});
```

### StorageStore

```js
import { StorageStore } from 'react-fast-fetch';

export const store = new StorageStore({
  // or sessionStorage as you want
  storage: localStorage,
  // maximum 500 url to cache
  limit: 500,
});
```

### IndexedDBStore

```js
import { IndexedDBStore } from 'react-fast-fetch';

export const store = new IndexedDBStore({
  // database name
  dbName: 'my-store',
  // maximum 5000 url to cache
  limit: 5000,
});
```

## Write a fetcher

### fetch

```js
const fetcher = (url) => fetch(url).then((res) => res.json());
```

### axios

```js
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data);
```

## useFetch hook

## Fetch component

If you are writting React function components, `<Fetch/>` component is made for you:

```jsx
import { useFetch } from 'react-fast-fetch';

class Posts extends React.Component {
  state = {
    posts: null,
  };

  render() {
    const { data, loading, reload, error } = this.state.posts || {};
    return (
      <div>
        <Fetch url="/posts?query=hello" onChange={(result) => this.setState({ posts: result })} />
        {loading && <span>Loading...</span>}
        {error && (
          <span>
            Failed to fetch data <button onClick={reload}>Reload</button>
          </span>
        )}
        {data?.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    );
  }
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

## Options

### disabled

Disable data fetching. This is useful when some parameters is required to fetch data.

```js
const [page, setPage] = useState(1);
const { data } = useFetch(`/posts?page=${page}`, { disabled: page < 1 });
```

### interval

Auto-reload data in N milliseconds. Use it to keep data up-to-date.

```js
const { data } = useFetch(`/notifications/unread`, { interval: 5000 });
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

## Return

### data

Result data returned by fetcher.

```tsx
const { data } = useFetch('/posts/1');
```

### loading

If here is NO cached data and fetcher is fetching data from remote, loading is set to true.

```tsx
const { data, loading } = useFetch('/posts/1');
return (
  <div>
    {loading && <div>Loading...</div>}
    {data && <div>{data.title}</div>}
  </div>
);
```

### reloading

If here is cached data and fetcher is fetching data from remote, reloading is set to true. In most
cases, you don't need to notice user that it is reloading if the API is fast enough. If the API is
indeed very slow, show some messages or progress bars that don't block user interaction.

```tsx
const { data, loading } = useFetch('/posts/1');
return (
  <div>
    {loading && <div>Loading...</div>}
    {reloading && <div>Refreshing...</div>}
    {data && <div>{data.title}</div>}
  </div>
);
```

### reload

A function to manually reload data from remote. Usually used in two cases:

1. Automatic fetch failed. See [error](#error) section bellow.
2. You modified the resource. For example, you delete a post and then you need to reload the list.

### error

Error throwed by fetcher. Usually mean user need to reload the data.

```tsx
const { data, loading } = useFetch('/posts/1');
return (
  <div>
    {loading && <div>Loading...</div>}
    {error && (
      <span>
        Failed to fetch data <button onClick={reload}>Reload</button>
      </span>
    )}
    {data && <div>{data.title}</div>}
  </div>
);
```
