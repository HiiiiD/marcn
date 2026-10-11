<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious onPress={() => setPage((p) => p - 1)} />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink isActive onPress={() => setPage(1)}>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext onPress={() => setPage((p) => p + 1)} />
    </PaginationItem>
  </PaginationContent>
</Pagination>
