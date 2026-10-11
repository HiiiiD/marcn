import { ApiReference } from "@/components/api-reference";
import { InstallSection } from "@/components/install-section";
import { H1, Lead } from "@/components/prose";
import { SnackPreview } from "@/components/snack-preview";
import { UsageSection } from "@/components/usage-section";
import { items, loadItem } from "@/lib/registry";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/$kind/$name")({
  loader: async ({ params }) => {
    const item = items.find((i) => i.name === params.name && i.kind === params.kind);
    if (!item) throw notFound();
    return { item, ...(await loadItem(item.name)) };
  },
  component: ItemPage,
});

function ItemPage() {
  const { item, files, example, usage, api } = Route.useLoaderData();
  return (
    <>
      <H1>{item.title}</H1>
      <Lead>{item.description}</Lead>
      {item.snackId && example && <SnackPreview id={item.snackId} example={example} />}
      {usage && <UsageSection usage={usage} />}
      <InstallSection item={item} files={files} />
      <ApiReference api={api} />
    </>
  );
}
