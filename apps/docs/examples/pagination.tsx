import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function Example() {
  const [page, setPage] = useState(1);
  const total = 10;
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious text={null} disabled={page === 1} onPress={() => setPage((p) => p - 1)} />
        </PaginationItem>
        {[1, 2, 3].map((n) => (
          <PaginationItem key={n}>
            <PaginationLink isActive={n === page} onPress={() => setPage(n)}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext text={null} disabled={page === total} onPress={() => setPage((p) => p + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
