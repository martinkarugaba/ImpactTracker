"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ConceptNote, NewConceptNote } from "../../types/types";
import { BudgetItem, NewBudgetItem } from "../../types/budget-item";

const conceptNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  charge_code: z.string().optional(),
  activity_lead: z.string().optional(),
  submission_date: z.date().optional(),
  project_summary: z.string().optional(),
  methodology: z.string().optional(),
  requirements: z.string().optional(),
  participant_details: z.string().optional(),
  budget_notes: z.string().optional(),
});

type ConceptNoteFormData = z.infer<typeof conceptNoteSchema>;

interface ConceptNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activityId: string;
  conceptNote?: ConceptNote;
  onSubmit: (data: NewConceptNote) => Promise<void>;
}

export function ConceptNoteDialog({
  open,
  onOpenChange,
  activityId,
  conceptNote,
  onSubmit,
}: ConceptNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    // Parse budget items from string[] to BudgetItem[]
    if (conceptNote?.budget_items && Array.isArray(conceptNote.budget_items)) {
      return conceptNote.budget_items
        .map((item: string) => {
          try {
            return JSON.parse(item) as BudgetItem;
          } catch (e) {
            console.error("Error parsing budget item:", e);
            return null;
          }
        })
        .filter((item): item is BudgetItem => item !== null);
    }
    return [];
  });
  const [newBudgetItem, setNewBudgetItem] = useState<NewBudgetItem>({
    description: "",
    quantity: 1,
    unitCost: 0,
    totalCost: 0,
  });

  const form = useForm<ConceptNoteFormData>({
    resolver: zodResolver(conceptNoteSchema),
    defaultValues: {
      title: conceptNote?.title ?? "",
      content: conceptNote?.content ?? "",
      charge_code: conceptNote?.charge_code ?? "",
      activity_lead: conceptNote?.activity_lead ?? "",
      submission_date: conceptNote?.submission_date
        ? new Date(conceptNote.submission_date)
        : undefined,
      project_summary: conceptNote?.project_summary ?? "",
      methodology: conceptNote?.methodology ?? "",
      requirements: conceptNote?.requirements ?? "",
      participant_details: conceptNote?.participant_details ?? "",
      budget_notes: conceptNote?.budget_notes ?? "",
    },
  });

  const handleAddBudgetItem = () => {
    if (
      !newBudgetItem.description ||
      newBudgetItem.quantity <= 0 ||
      newBudgetItem.unitCost <= 0
    ) {
      return;
    }

    const totalCost = newBudgetItem.quantity * newBudgetItem.unitCost;

    setBudgetItems([
      ...budgetItems,
      {
        id: uuidv4(),
        description: newBudgetItem.description,
        quantity: newBudgetItem.quantity,
        unitCost: newBudgetItem.unitCost,
        totalCost,
      },
    ]);

    setNewBudgetItem({
      description: "",
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
    });
  };

  const handleUpdateBudgetItemField = (
    field: keyof NewBudgetItem,
    value: string | number
  ) => {
    setNewBudgetItem(prev => {
      const updated = { ...prev, [field]: value };

      if (field === "quantity" || field === "unitCost") {
        const quantity = field === "quantity" ? Number(value) : prev.quantity;
        const unitCost = field === "unitCost" ? Number(value) : prev.unitCost;
        updated.totalCost = quantity * unitCost;
      }

      return updated;
    });
  };

  const handleRemoveBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const handleSubmit = async (data: ConceptNoteFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        activity_id: activityId,
        title: data.title,
        content: data.content,
        charge_code: data.charge_code || null,
        activity_lead: data.activity_lead || null,
        submission_date: data.submission_date || null,
        project_summary: data.project_summary || null,
        methodology: data.methodology || null,
        requirements: data.requirements || null,
        participant_details: data.participant_details || null,
        budget_items: budgetItems.map(item => JSON.stringify(item)),
        budget_notes: data.budget_notes || null,
      });
      onOpenChange(false);
      form.reset();
      setBudgetItems([]);
    } catch (error) {
      console.error("Error saving concept note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {conceptNote ? "Edit Concept Note" : "Create Concept Note"}
          </DialogTitle>
          <DialogDescription>
            {conceptNote
              ? "Update the concept note details for this activity."
              : "Create a new concept note for this activity."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter concept note title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="charge_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Charge Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter charge code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activity_lead"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Lead</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter activity lead name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="submission_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={date =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the main content of the concept note..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project summary..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="methodology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Methodology</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the methodology..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the requirements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="participant_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter participant details..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Budget Items</h3>
                <p className="text-muted-foreground text-sm">
                  Add budget items for this concept note.
                </p>
              </div>

              <div className="rounded-md border">
                <div className="bg-muted/50 grid grid-cols-12 gap-2 px-4 py-2">
                  <div className="col-span-5 font-medium">Description</div>
                  <div className="col-span-2 font-medium">Quantity</div>
                  <div className="col-span-2 font-medium">Unit Cost (UGX)</div>
                  <div className="col-span-2 font-medium">Total (UGX)</div>
                  <div className="col-span-1"></div>
                </div>

                {budgetItems.length > 0 ? (
                  <div className="divide-y">
                    {budgetItems.map(item => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 px-4 py-3"
                      >
                        <div className="col-span-5">{item.description}</div>
                        <div className="col-span-2">{item.quantity}</div>
                        <div className="col-span-2">
                          {item.unitCost.toLocaleString()}
                        </div>
                        <div className="col-span-2">
                          {item.totalCost.toLocaleString()}
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveBudgetItem(item.id)}
                          >
                            &times;
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-8 text-center text-sm">
                    No budget items added yet.
                  </div>
                )}

                <div className="bg-muted/20 grid grid-cols-12 gap-2 border-t px-4 py-3">
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      value={newBudgetItem.description}
                      onChange={e =>
                        handleUpdateBudgetItemField(
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={newBudgetItem.quantity}
                      onChange={e =>
                        handleUpdateBudgetItemField(
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      placeholder="Unit cost"
                      value={newBudgetItem.unitCost}
                      onChange={e =>
                        handleUpdateBudgetItemField(
                          "unitCost",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    {newBudgetItem.totalCost.toLocaleString()}
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddBudgetItem}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {budgetItems.length > 0 && (
                  <div className="bg-muted/40 flex items-center justify-end gap-2 px-4 py-2 text-sm font-medium">
                    <div>Total Budget:</div>
                    <div>
                      {budgetItems
                        .reduce((sum, item) => sum + item.totalCost, 0)
                        .toLocaleString()}{" "}
                      UGX
                    </div>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="budget_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional budget notes..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {conceptNote ? "Update" : "Create"} Concept Note
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
