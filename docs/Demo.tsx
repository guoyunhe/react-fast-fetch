import { useState } from 'react';
import { FetchConfigProvider, IndexedDBStore, useFetch } from 'react-fast-fetch';

const fetcher = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      const data = [];
      for (let i = 0; i < 10; i++) {
        const obj = { id: i, title: 'foobar ' + Math.random() };
        data.push(obj);
      }
      resolve(data);
    }, 500);
  });

const store = new IndexedDBStore({ limit: 10000 });

export default function App() {
  return (
    <FetchConfigProvider fetcher={fetcher} store={store}>
      <Posts />
    </FetchConfigProvider>
  );
}

function Posts() {
  const [page, setPage] = useState(1);
  const { data, loading, reloading } = useFetch<{ id: number; title: string }[]>(
    `/posts?page=${page}`,
    {
      disabled: page < 1,
      interval: 3000,
    }
  );
  return (
    <div>
      <button onClick={() => setPage((prev) => prev - 1)}>Prev</button>
      {page}
      <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
      {loading && <span>Loading...</span>}
      {reloading && <span>Reloading...</span>}
      <ul>
        {data?.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
