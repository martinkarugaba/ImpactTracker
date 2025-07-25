export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface NewBudgetItem {
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}
