import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function Example() {
  return (
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
  );
}
