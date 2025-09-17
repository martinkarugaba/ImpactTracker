import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Mail, Phone, Calendar, TrendingUp } from "lucide-react";
import { getVSLAMembers } from "../../actions/vsla-members";
import { AddVSLAMemberDialog } from "../dialogs/add-vsla-member-dialog";
import { AddParticipantToVSLADialog } from "../dialogs/add-participant-to-vsla-dialog";
import { formatCurrency } from "@/lib/utils";

interface VSLAMembersSectionProps {
  vsla: {
    id: string;
    cluster_id: string | null;
  };
}

export async function VSLAMembersSection({ vsla }: VSLAMembersSectionProps) {
  const membersResult = await getVSLAMembers(vsla.id);
  const members = membersResult.success ? membersResult.data || [] : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            VSLA Members ({members.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <AddParticipantToVSLADialog
              vslaId={vsla.id}
              clusterId={vsla.cluster_id || ""}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No members yet</h3>
            <p className="text-muted-foreground">
              Start by adding new members or existing participants to this VSLA.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <AddParticipantToVSLADialog
                vslaId={vsla.id}
                clusterId={vsla.cluster_id || ""}
              />
              <AddVSLAMemberDialog vslaId={vsla.id}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Member
                </Button>
              </AddVSLAMemberDialog>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map(member => (
              <div
                key={member.id}
                className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">
                        {member.first_name} {member.last_name}
                      </h4>
                      <Badge
                        variant={
                          member.role === "chairperson" ||
                          member.role === "secretary" ||
                          member.role === "treasurer"
                            ? "default"
                            : "outline"
                        }
                        className="capitalize"
                      >
                        {member.role}
                      </Badge>
                      <Badge
                        variant={
                          member.status === "active"
                            ? "default"
                            : member.status === "inactive"
                              ? "secondary"
                              : "destructive"
                        }
                        className="capitalize"
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      {member.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{member.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {"Joined "}
                          {new Date(member.joined_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatCurrency(member.total_savings)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">
                        {formatCurrency(member.total_loans)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
