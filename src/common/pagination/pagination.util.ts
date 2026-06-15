import {
  PaginatedResult,
  PaginationMeta,
} from '../interfaces/api-response.interface';

export function getPaginationParams(page = 1, limit = 20) {
  const normalizedPage = Math.max(page, 1);
  const normalizedLimit = Math.min(Math.max(limit, 1), 100);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
    take: normalizedLimit,
  };
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: buildPaginationMeta(page, limit, total),
  };
}