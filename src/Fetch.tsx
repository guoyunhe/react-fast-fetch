import { useEffect, useRef } from 'react';
import { FetchOptions } from './types';
import { UseFetchReturn, useFetch } from './useFetch';

export interface FetchRefAttrs {
  reload: () => Promise<void>;
  remove: () => Promise<void>;
}

export interface FetchProps<T> extends FetchOptions<T> {
  url: string;
  onChange?: (result: UseFetchReturn<T>) => void;
}

/**
 * Component implementation of fast fetch, for class components.
 * Actually, it is only a thin wrapper of the `useFetch()` hook.
 *
 * ```jsx
 * class MyComp extends React.Component {
 *   state = {
 *     post: {}, // create a state for post fetch
 *   }
 *
 *   render() {
 *     const { post } = this.state;
 *     return <div>
 *       <Fetch
 *         url="https://example.com/api/posts/123"
 *         onChange={result => this.setState({ post: result })}
 *       />
 *
 *       <h1>{post.data?.title}</h1>
 *       <div>{post.data?.content}</div>
 *
 *       <button onClick={post.reload}>Reload</button>
 *       <button
 *         onClick={async () => {
 *           await axios.delete('https://example.com/api/posts/123');
 *           // clear cache after the resource is deleted from remote
 *           post.remove();
 *         }
 *       >
 *         Delete
 *       </button>
 *     <div>;
 *   }
 * }
 * ```
 */
export function Fetch<T>({ url, onChange, ...options }: FetchProps<T>) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const result = useFetch(url, options);

  useEffect(() => {
    onChangeRef.current?.(result);
  }, Object.values(result));

  return null;
}
