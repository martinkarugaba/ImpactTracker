import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AssignmentLevel } from "../../advanced-assignment/types";

interface AssignmentLevelTabsProps {
  currentLevel: AssignmentLevel;
  onLevelChange: (level: AssignmentLevel) => void;
  children: React.ReactNode;
}

export function AssignmentLevelTabs({
  currentLevel,
  onLevelChange,
  children,
}: AssignmentLevelTabsProps) {
  return (
    <Tabs
      value={currentLevel}
      onValueChange={value => onLevelChange(value as AssignmentLevel)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="subcounty">Subcounties</TabsTrigger>
        <TabsTrigger value="parish">Parishes</TabsTrigger>
      </TabsList>

      <TabsContent value="subcounty" className="mt-4">
        {children}
      </TabsContent>

      <TabsContent value="parish" className="mt-4">
        {children}
      </TabsContent>
    </Tabs>
  );
}
