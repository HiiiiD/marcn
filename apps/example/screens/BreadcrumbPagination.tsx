import { useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const trail = ['Home', 'Components', 'Navigation', 'Data display', 'Tables', 'Sortable'];

export function BreadcrumbPagination() {
  const [page, setPage] = useState(3);
  const total = 10;
  return (
    <>
      <Section title="Breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Home</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink>Components</BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Section>
      <Section title="Breadcrumb (long, wraps)">
        <Breadcrumb>
          <BreadcrumbList>
            {trail.map((label, i) => (
              <BreadcrumbItem key={label}>
                {i === trail.length - 1 ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink>{label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </Section>
      <Section title="Pagination">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious disabled={page === 1} onPress={() => setPage((p) => p - 1)} />
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
              <PaginationNext disabled={page === total} onPress={() => setPage((p) => p + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <Text variant="muted">Page {page} of {total}</Text>
      </Section>
      <Section title="Pagination (icon only)">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious text={null} disabled={page === 1} onPress={() => setPage((p) => p - 1)} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext text={null} disabled={page === total} onPress={() => setPage((p) => p + 1)} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Section>
    </>
  );
}
