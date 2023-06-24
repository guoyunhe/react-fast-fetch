import { ReactNode } from 'react';

export interface ReactFetchProps {
  children: ReactNode;
}

export function ReactFetch({ children }: ReactFetchProps) {
  return <div className="ReactFetch">{children}</div>;
}
