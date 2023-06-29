import { useState } from 'react';
import { FetchConfigProvider, IndexedDBStore, useFetch } from 'react-fast-fetch';

const fetcher = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: 'foo ' + Math.random() },
        { id: 2, title: 'bar ' + Math.random() },
      ]);
    }, 2000);
  });

const store = new IndexedDBStore({ limit: 10 });

export default function App() {
  return (
    <FetchConfigProvider fetcher={fetcher} store={store}>
      <Posts />
    </FetchConfigProvider>
  );
}

function Posts() {
  const [page, setPage] = useState(1);
  const { data, loading } = useFetch<{ id: number; title: string }[]>(`/posts?page=${page}`, {
    disabled: page < 1,
  });
  return (
    <div>
      <button onClick={() => setPage((prev) => prev - 1)}>Prev</button>
      {page}
      <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
      {loading && <span>Loading...</span>}
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
