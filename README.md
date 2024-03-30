# React Fast Fetch

**React Fast Fetch** is a stale-while-revalidate implementation. It can fetch and cache remote data in React apps. Make your app load faster without writting more code. [Try this demo](https://codesandbox.io/s/sleepy-darkness-n6pkzd?file=/src/App.js)

## Install

```bash
npm i -S react-fast-fetch
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

## Usage

### Setup

```jsx
import { FetchConfigProvider, IndexedDBStore } from 'react-fast-fetch';
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
```

### Use `useFetch()` hook

If you are writting React function components, `useFetch()` hook is best for you:

```jsx
import { useFetch } from 'react-fast-fetch';

function Posts() {
  const { data, loading, reload, error } = useFetch('/posts?query=hello');
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
```

### Use `<Fetch/>` component

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
