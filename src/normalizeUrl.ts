/**
 * normalize-url package doesn't support partial url like `/foo/bar?id=123`, so I created my own.
 */
export function normalizeUrl(url: string, params?: any): string {
  const [path, rest] = url.split('?');
  // trim ending slash from path
  let trimedPath = path;
  if (path.endsWith('/')) {
    trimedPath = path.substring(0, path.length - 1);
  }

  // remove hash and get pure search
  const search = rest?.split('#')[0];

  if (!search && !params) {
    return trimedPath;
  }

  const searchParams = new URLSearchParams(search);

  // delete empty params
  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (!value) {
      searchParams.delete(key);
    }
  });

  // append params
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
  }

  // sort params
  searchParams.sort();
  const sortedSearch = searchParams.toString();

  if (!sortedSearch) {
    return trimedPath;
  }

  return trimedPath + '?' + sortedSearch;
}
