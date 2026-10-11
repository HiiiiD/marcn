import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Example() {
  return (
    <Accordion type="single" collapsible defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It sets expanded state on each trigger.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes, the height animates with reanimated.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
