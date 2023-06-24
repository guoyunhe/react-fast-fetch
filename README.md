# react-fetch

Fetch and cache remote data in React apps.

HTTP client adaptors:

- fetch API
- axios

Browser cache adaptors:

- Memory (a `Map` object, not persist)
- IndexedDB (persist, almost no limit in size)

Why not localStorage?

- Both of them have 5MB size limit and can be easily filled up. Once the storage is full, any write access will throw errors and may break other functionalities that depend on localStorage.
- It is hard, if possible, to isolate cache from other important data, like auth tokens. Make cleaning and invalidating caches hard.

## Install

```bash
npm i @guoyunhe/react-fetch
```

## Usage

```ts
import { hello } from '@guoyunhe/react-fetch';

hello('world');
```
