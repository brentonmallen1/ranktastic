
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ArrowUpDown, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { VotingFormValues } from "./VoterForm";

interface RankingListProps {
  form: UseFormReturn<VotingFormValues>;
  rankedOptions: string[];
  setRankedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

const RankingList = ({ form, rankedOptions, setRankedOptions }: RankingListProps) => {
  // Handle drag end event
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(rankedOptions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setRankedOptions(items);
    form.setValue("rankings", items);
  };

  // Move option up in the list
  const moveOptionUp = (index: number) => {
    if (index === 0) return;
    
    const newOptions = [...rankedOptions];
    [newOptions[index - 1], newOptions[index]] = [newOptions[index], newOptions[index - 1]];
    
    setRankedOptions(newOptions);
    form.setValue("rankings", newOptions);
  };

  // Move option down in the list
  const moveOptionDown = (index: number) => {
    if (index === rankedOptions.length - 1) return;
    
    const newOptions = [...rankedOptions];
    [newOptions[index], newOptions[index + 1]] = [newOptions[index + 1], newOptions[index]];
    
    setRankedOptions(newOptions);
    form.setValue("rankings", newOptions);
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
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {rankedOptions.map((option, index) => (
                      <Draggable key={option} draggableId={option} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-2 p-3 bg-background/50 rounded-md border transition-smooth group"
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                              {index + 1}
                            </span>
                            
                            <span className="flex-1">{option}</span>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveOptionUp(index)}
                                disabled={index === 0}
                                className="h-8 w-8"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => moveOptionDown(index)}
                                disabled={index === rankedOptions.length - 1}
                                className="h-8 w-8"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        )}
                      </Draggable>
                    ))}
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
};

export default RankingList;
