import { useFetch } from '@guoyunhe/react-fetch';

export default function Demo() {
  const { data } = useFetch('');
  return (
    <div>
      <div>Hello</div>
    </div>
  );
}
