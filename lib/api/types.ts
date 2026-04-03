// Types for API layer
export interface FetchOptions {
  cache?: 'default' | 'no-store' | 'reload' | 'force-cache' | 'only-if-cached' | 'stale-while-revalidate';
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginationInfo {
  limit: number;
  offset: number;
  totalCount: number;
  hasMore: boolean;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  key: string;
  value: string;
}
