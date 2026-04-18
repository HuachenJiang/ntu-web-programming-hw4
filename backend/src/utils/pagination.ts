export interface PaginationInput {
  page?: number;
  limit?: number;
}

export function normalizePagination(input: PaginationInput) {
  const page = input.page ?? 1;
  const limit = input.limit ?? 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}
