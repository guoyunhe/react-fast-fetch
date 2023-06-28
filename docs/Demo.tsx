import { useState } from 'react';
import { FetchConfigProvider, IndexedDBStore, useFetch } from 'react-fast-fetch';

const fetcher = async (url: string) => [
  { id: 1, title: 'foo' },
  { id: 2, title: 'bar' },
];

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
  const { data, loading } = useFetch<{ id: number; title: string }[]>(`/posts?page=${page}`);
  return (
    <div>
      <button onClick={() => setPage((prev) => prev - 1)}>Prev</button>
      <button onClick={() => setPage((prev) => prev + 1)}>Next</button>
      {loading && <span>Loading...</span>}
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
