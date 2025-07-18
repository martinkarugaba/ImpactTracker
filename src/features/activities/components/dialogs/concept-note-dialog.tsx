"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity } from "../../types/types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

// Define the budget item type
type BudgetItem = {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
};

// Define the schema for concept note data
const conceptNoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  chargeCode: z.string().min(1, "Charge code is required"),
  activityLead: z.string().min(1, "Activity lead is required"),
  submissionDate: z.date(),
  projectSummary: z.string().min(1, "Project summary is required"),
  objectives: z.string().min(1, "Objectives are required"),
  methodology: z.string().min(1, "Methodology is required"),
  requirements: z.string().min(1, "Requirements are required"),
  participantDetails: z.string().min(1, "Participant details are required"),
  // Budget is no longer a string field, since we handle it separately with a custom UI
  budgetNotes: z.string().optional(),
});

type ConceptNoteFormValues = z.infer<typeof conceptNoteSchema>;

interface ConceptNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity;
  onSave: (conceptNote: string) => void;
}

export function ConceptNoteDialog({
  open,
  onOpenChange,
  activity,
  onSave,
}: ConceptNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [newBudgetItem, setNewBudgetItem] = useState<{
    description: string;
    quantity: string;
    unitCost: string;
  }>({
    description: "",
    quantity: "1",
    unitCost: "0",
  });

  // Parse existing concept note if available
  const existingConceptNote = activity.conceptNote ? activity.conceptNote : "";

  // Handle budget item actions
  const addBudgetItem = () => {
    const quantity = parseFloat(newBudgetItem.quantity);
    const unitCost = parseFloat(newBudgetItem.unitCost);
    const totalCost = quantity * unitCost;

    if (newBudgetItem.description && !isNaN(quantity) && !isNaN(unitCost)) {
      setBudgetItems([
        ...budgetItems,
        {
          id: crypto.randomUUID(),
          description: newBudgetItem.description,
          quantity,
          unitCost,
          totalCost,
        },
      ]);

      setNewBudgetItem({
        description: "",
        quantity: "1",
        unitCost: "0",
      });
    }
  };

  const removeBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const calculateTotalBudget = () => {
    return budgetItems.reduce((sum, item) => sum + item.totalCost, 0);
  };

  // Form setup
  const form = useForm<ConceptNoteFormValues>({
    resolver: zodResolver(conceptNoteSchema),
    defaultValues: {
      title: activity.title || "",
      chargeCode: "",
      activityLead: "",
      submissionDate: new Date(),
      projectSummary: "",
      objectives: existingConceptNote,
      methodology: "",
      requirements: "",
      participantDetails: "",
      budgetNotes: "",
    },
  });

  const handleSave = async (values: ConceptNoteFormValues) => {
    setIsLoading(true);
    try {
      // Format the budget table
      // Format the budget table
      let budgetTable = "";
      if (budgetItems.length > 0) {
        budgetTable = `
| Item Description | Quantity | Unit Cost | Total Cost |
|------------------|----------|-----------|------------|
${budgetItems
  .map(
    item =>
      `| ${item.description} | ${item.quantity} | ${item.unitCost.toFixed(2)} | ${item.totalCost.toFixed(2)} |`
  )
  .join("\n")}
| **TOTAL** | | | **${calculateTotalBudget().toFixed(2)}** |
`;
      } else {
        budgetTable = "No budget items specified.";
      }

      // Format the concept note into a structured string
      const formattedConceptNote = `
# ${values.title} - Concept Note
Charge Code: ${values.chargeCode}
Activity Lead: ${values.activityLead}
Submission Date: ${format(values.submissionDate, "PPP")}

## Project Summary/Introduction
${values.projectSummary}

## Objectives/Purpose
${values.objectives}

## Methodology
${values.methodology}

## Requirements
${values.requirements}

## Participant Details
${values.participantDetails}

## Budget
${budgetTable}
${values.budgetNotes ? `\nBudget Notes:\n${values.budgetNotes}` : ""}
`.trim();

      await onSave(formattedConceptNote);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save concept note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>
            {activity.conceptNote ? "Edit" : "Add"} Concept Note
          </DialogTitle>
          <DialogDescription>
            Provide a detailed concept note for "{activity.title}" including all
            required fields.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title of Activity</FormLabel>
                    <FormControl>
                      <Input placeholder="Activity title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Charge Code */}
              <FormField
                control={form.control}
                name="chargeCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Charge Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Charge code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Activity Lead */}
              <FormField
                control={form.control}
                name="activityLead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Lead</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Person responsible for this activity"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submission Date */}
              <FormField
                control={form.control}
                name="submissionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
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
                          disabled={date => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Project Summary */}
            <FormField
              control={form.control}
              name="projectSummary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Summary/Introduction</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief introduction about the project and context"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Objectives */}
            <FormField
              control={form.control}
              name="objectives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectives/Purpose of the Activity</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What are the key objectives of this activity?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Methodology */}
            <FormField
              control={form.control}
              name="methodology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Methodology</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How will the activity be carried out?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirements */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What resources and materials are needed?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participant Details */}
            <FormField
              control={form.control}
              name="participantDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participant Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Information about participants, selection criteria, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Budget</h3>
                <p className="text-muted-foreground text-sm">
                  Add budget items to create a detailed budget table.
                </p>
              </div>

              {/* Budget Items Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[120px]">Unit Cost</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-muted-foreground py-4 text-center"
                        >
                          No budget items added. Add some items below.
                        </TableCell>
                      </TableRow>
                    ) : (
                      budgetItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitCost.toFixed(2)}</TableCell>
                          <TableCell>{item.totalCost.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBudgetItem(item.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}

                    {/* Total Row */}
                    {budgetItems.length > 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium"
                        >
                          Total
                        </TableCell>
                        <TableCell className="font-medium">
                          {calculateTotalBudget().toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}

                    {/* Add New Item Row */}
                    <TableRow>
                      <TableCell>
                        <Input
                          placeholder="Item description"
                          value={newBudgetItem.description}
                          onChange={e => {
                            setNewBudgetItem({
                              ...newBudgetItem,
                              description: e.target.value,
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="Qty"
                          value={newBudgetItem.quantity}
                          onChange={e => {
                            setNewBudgetItem({
                              ...newBudgetItem,
                              quantity: e.target.value,
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Unit cost"
                          value={newBudgetItem.unitCost}
                          onChange={e => {
                            setNewBudgetItem({
                              ...newBudgetItem,
                              unitCost: e.target.value,
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell colSpan={2}>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          onClick={addBudgetItem}
                          disabled={
                            !newBudgetItem.description ||
                            isNaN(parseFloat(newBudgetItem.quantity)) ||
                            isNaN(parseFloat(newBudgetItem.unitCost))
                          }
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Additional Budget Notes */}
              <FormField
                control={form.control}
                name="budgetNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Budget Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes about the budget..."
                        className="min-h-[60px]"
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
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Concept Note"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
