import { useState } from 'react';
import type { RecordFilters } from '../types/models';

const defaultFilters: RecordFilters = {
  q: '',
  category: 'all',
};

export function useRecordFilters() {
  const [filters, setFilters] = useState<RecordFilters>(defaultFilters);

  return {
    filters,
    setQuery(q: string) {
      setFilters((previous) => ({
        ...previous,
        q,
      }));
    },
    setCategory(category: RecordFilters['category']) {
      setFilters((previous) => ({
        ...previous,
        category,
      }));
    },
    reset() {
      setFilters(defaultFilters);
    },
  };
}
