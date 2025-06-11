/**
 * Pagination utilities for IraChat
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

export interface InfiniteScrollOptions {
  initialLimit?: number;
  loadMoreLimit?: number;
  threshold?: number; // How close to the end before loading more
}

export interface InfiniteScrollState<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  error?: string;
  page: number;
  total: number;
}

/**
 * Create pagination parameters from options
 */
export const createPaginationParams = (options: PaginationOptions = {}) => {
  const {
    page = 1,
    limit = 20,
    offset,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options;

  const actualOffset = offset !== undefined ? offset : (page - 1) * limit;

  return {
    page,
    limit,
    offset: actualOffset,
    sortBy,
    sortOrder
  };
};

/**
 * Create pagination result from data and options
 */
export const createPaginationResult = <T>(
  data: T[],
  total: number,
  options: PaginationOptions = {}
): PaginationResult<T> => {
  const { page = 1, limit = 20 } = options;
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage: hasNext ? page + 1 : undefined,
      prevPage: hasPrev ? page - 1 : undefined
    }
  };
};

/**
 * Calculate pagination info
 */
export const calculatePagination = (
  currentPage: number,
  totalItems: number,
  itemsPerPage: number
) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    isFirst: currentPage === 1,
    isLast: currentPage === totalPages
  };
};

/**
 * Get page numbers for pagination UI
 */
export const getPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): (number | string)[] => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const halfVisible = Math.floor(maxVisible / 2);

  // Always show first page
  pages.push(1);

  let startPage = Math.max(2, currentPage - halfVisible);
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

  // Adjust if we're near the beginning
  if (currentPage <= halfVisible + 1) {
    endPage = Math.min(totalPages - 1, maxVisible - 1);
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - halfVisible) {
    startPage = Math.max(2, totalPages - maxVisible + 2);
  }

  // Add ellipsis if needed
  if (startPage > 2) {
    pages.push('...');
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Add ellipsis if needed
  if (endPage < totalPages - 1) {
    pages.push('...');
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

/**
 * Infinite scroll utilities
 */
export class InfiniteScrollManager<T> {
  private state: InfiniteScrollState<T>;
  private options: InfiniteScrollOptions;
  private loadFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number }>;

  constructor(
    loadFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
    options: InfiniteScrollOptions = {}
  ) {
    this.loadFunction = loadFunction;
    this.options = {
      initialLimit: 20,
      loadMoreLimit: 20,
      threshold: 0.8,
      ...options
    };
    
    this.state = {
      data: [],
      loading: false,
      hasMore: true,
      page: 0,
      total: 0
    };
  }

  async loadInitial(): Promise<InfiniteScrollState<T>> {
    this.state.loading = true;
    this.state.error = undefined;

    try {
      const result = await this.loadFunction(1, this.options.initialLimit!);
      
      this.state = {
        data: result.data,
        loading: false,
        hasMore: result.data.length === this.options.initialLimit,
        page: 1,
        total: result.total
      };
    } catch (error) {
      this.state.loading = false;
      this.state.error = error instanceof Error ? error.message : 'Failed to load data';
    }

    return { ...this.state };
  }

  async loadMore(): Promise<InfiniteScrollState<T>> {
    if (this.state.loading || !this.state.hasMore) {
      return { ...this.state };
    }

    this.state.loading = true;
    this.state.error = undefined;

    try {
      const nextPage = this.state.page + 1;
      const result = await this.loadFunction(nextPage, this.options.loadMoreLimit!);
      
      this.state = {
        data: [...this.state.data, ...result.data],
        loading: false,
        hasMore: result.data.length === this.options.loadMoreLimit,
        page: nextPage,
        total: result.total
      };
    } catch (error) {
      this.state.loading = false;
      this.state.error = error instanceof Error ? error.message : 'Failed to load more data';
    }

    return { ...this.state };
  }

  shouldLoadMore(scrollPosition: number, contentHeight: number, containerHeight: number): boolean {
    if (this.state.loading || !this.state.hasMore) {
      return false;
    }

    const scrollPercentage = (scrollPosition + containerHeight) / contentHeight;
    return scrollPercentage >= this.options.threshold!;
  }

  reset(): void {
    this.state = {
      data: [],
      loading: false,
      hasMore: true,
      page: 0,
      total: 0
    };
  }

  getState(): InfiniteScrollState<T> {
    return { ...this.state };
  }
}

/**
 * Hook-like utilities for React components
 */
export const usePaginationHelpers = () => {
  const goToPage = (currentPage: number, targetPage: number, totalPages: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage) {
      return currentPage;
    }
    return targetPage;
  };

  const goToNextPage = (currentPage: number, totalPages: number) => {
    return goToPage(currentPage, currentPage + 1, totalPages);
  };

  const goToPrevPage = (currentPage: number, totalPages: number) => {
    return goToPage(currentPage, currentPage - 1, totalPages);
  };

  const goToFirstPage = () => 1;

  const goToLastPage = (totalPages: number) => totalPages;

  return {
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage
  };
};

// Additional exports for UpdatesScreen compatibility
export const handleRefresh = async (
  setRefreshing: (refreshing: boolean) => void,
  loadData: () => Promise<void>
): Promise<void> => {
  try {
    setRefreshing(true);
    await loadData();
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    setRefreshing(false);
  }
};

export const loadMoreUpdates = async (
  hasMore: boolean,
  isLoading: boolean,
  loadData: () => Promise<void>
): Promise<void> => {
  if (!hasMore || isLoading) {
    return;
  }

  try {
    await loadData();
  } catch (error) {
    console.error('Error loading more updates:', error);
  }
};

export default {
  createPaginationParams,
  createPaginationResult,
  calculatePagination,
  getPageNumbers,
  InfiniteScrollManager,
  usePaginationHelpers,
  handleRefresh,
  loadMoreUpdates
};
