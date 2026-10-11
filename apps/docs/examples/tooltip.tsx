import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function Example() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>Hover or long-press</TooltipTrigger>
      <TooltipContent>Add to library</TooltipContent>
    </Tooltip>
  );
}
