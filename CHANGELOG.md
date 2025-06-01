# Changelog

## 1.14.0 - 2025-06-01

- Changed to reset data when disabled is true and preserve is false

## 1.13.0 - 2025-04-11

- Added `preserve` option to `useFetch()` hook.

## 1.12.0 - 2025-01-13

- Reference to `reload` and `remove` will not change anymore

## 1.11.0 - 2024-08-12

- Purge invalid data when URL has changed

## 1.10.0 - 2024-06-26

- Added `initData` option to `IndexedDBStore`

## 1.9.0 - 2024-05-20

- Added `dependencies` option to reload data even if URL doesn't change

## 1.8.0 - 2024-04-25

- Added `"sideEffects": false` to package.json

## 1.7.0 - 2024-04-19

- Updated to `idb` 8

## 1.6.0 - 2024-03-31

- Added `params` options, so you don't have to write search string by hand (you can have many typos!).
  ```js
  // before
  const { data } = useFetch(`/foo/bar?page=${page}&pageSize=${pageSize}`);
  // now
  const { data } = useFetch('/foo/bar', { params: { page, pageSize } });
  ```
- Normalize url internally to avoid duplicated records in store. For example, `/foo/bar/?b=2&a=1&c=`
  will be normalized to `/foo/bar?a=1&b=2`. (Search params are sorted and ending slashes are trimed)

## 1.5.0 - 2024-03-30

- Added `StorageStore` to support localStorage and sessionStorage

## 1.4.0 - 2023-09-15

- Added `<Fetch/>` component to use in class components. Note: it is only a thin wrapper around the
  `useFetch()` hook

## 1.3.0 - 2023-07-30

- Added `interval` option to `useFetch()` hook

## 1.2.0 - 2023-07-27

- Changed to immediately fetch remote data without check cache existance. This is because IndexedDB
  read can be very slow in Chrome when CPU load is heavy.

## 1.1.0 - 2023-07-08

- Added `remove` function return to `useFetch()` hook

## 1.0.0 - 2023-06-24

- Added `<FetchConfigProvider/>` component
- Added `useFetch()` hook
- Added `IndexedDBStore`
- Added `MemoryStore`
