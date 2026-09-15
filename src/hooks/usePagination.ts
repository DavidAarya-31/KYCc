import { useState } from 'react';

export const PAGE_SIZE = 20;

export function usePagination() {
  const [page, setPage] = useState(0);

  return {
    page,
    setPage,
    from: page * PAGE_SIZE,
    to:   page * PAGE_SIZE + PAGE_SIZE - 1,
    nextPage: () => setPage(p => p + 1),
    prevPage: () => setPage(p => Math.max(0, p - 1)),
    reset:    () => setPage(0),
  };
}
