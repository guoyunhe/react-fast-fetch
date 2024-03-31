import { useMemo } from 'react';
import { normalizeUrl } from './normalizeUrl';

export function useNormalizedUrl(url: string, params: any) {
  return useMemo(() => normalizeUrl(url, params), [url, params]);
}
