import { type Dispatch, type SetStateAction } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PollOption } from '@/types';

export interface VotingFormValues {
  voter_name: string;
  voter_email?: string;
  rankings: string[];
}

interface RankableOptionsProps {
  form: UseFormReturn<VotingFormValues>;
  rankedOptions: string[];
  setRankedOptions: Dispatch<SetStateAction<string[]>>;
  pollOptions?: PollOption[];
}

export function RankableOptions({ form, rankedOptions, setRankedOptions, pollOptions }: RankableOptionsProps) {
  const descriptionMap = new Map(
    (pollOptions ?? []).filter((o) => o.description).map((o) => [o.name, o.description!])
  );

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(rankedOptions);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setRankedOptions(items);
    form.setValue('rankings', items);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...rankedOptions];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    setRankedOptions(items);
    form.setValue('rankings', items);
  };

  const moveDown = (index: number) => {
    if (index === rankedOptions.length - 1) return;
    const items = [...rankedOptions];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setRankedOptions(items);
    form.setValue('rankings', items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Rank Your Choices</FormLabel>
        <div className="flex items-center text-sm text-muted-foreground">
          <ArrowUpDown className="mr-1 h-4 w-4" />
          Drag or use arrows to reorder
        </div>
      </div>
      <FormField
        control={form.control}
        name="rankings"
        render={() => (
          <FormItem>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="rankings">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {rankedOptions.map((option, index) => {
                      const description = descriptionMap.get(option);
                      return (
                        <Draggable key={option} draggableId={option} index={index}>
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                position: snapshot.isDragging ? 'absolute' : 'relative',
                                zIndex: snapshot.isDragging ? 9999 : 'auto',
                              }}
                              className={`rounded-md border ${snapshot.isDragging ? 'bg-accent shadow-md' : 'bg-background/50'}`}
                            >
                              <Collapsible>
                                <div className="flex items-center gap-2 p-3 group">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing p-1"
                                  >
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                                    {index + 1}
                                  </span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="flex-1 truncate cursor-default">{option}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>{option}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  {description && (
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground [&[data-state=open]>svg]:rotate-180"
                                        aria-label="Toggle description"
                                      >
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                      </Button>
                                    </CollapsibleTrigger>
                                  )}
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => moveUp(index)} disabled={index === 0} className="h-8 w-8" aria-label="Move up">
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => moveDown(index)} disabled={index === rankedOptions.length - 1} className="h-8 w-8" aria-label="Move down">
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {description && (
                                  <CollapsibleContent>
                                    <p className="px-3 pb-3 pt-2 text-sm text-muted-foreground border-t border-border/50">
                                      {description}
                                    </p>
                                  </CollapsibleContent>
                                )}
                              </Collapsible>
                            </li>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
