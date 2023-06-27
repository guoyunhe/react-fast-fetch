import { useFetch } from 'react-fast-fetch';

export default function Demo() {
  const { data } = useFetch('');
  return (
    <div>
      <div>Hello</div>
    </div>
  );
}
