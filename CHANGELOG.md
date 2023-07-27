# Changelog

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
