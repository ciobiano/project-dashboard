import { DashboardHeader } from "./dashboard-header";
import { DashboardLayout } from "./dashboard-layout";
import { MetricCards } from "./metric-cards";
import { TaskBoard } from "./task-board";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className=" my-4 flex flex-1 flex-col rounded-l-xl border border-black bg-sidebar-foreground p-4 shadow-2xl">
        <DashboardHeader />
        <main className="flex-1 space-y-4 pt-6">
          <div>
            <Alert className="flex gap-2 items-center border-secondary/40 bg-secondary text-primary">
              <Zap className="h-4 w-4" />
              <AlertTitle>
                Upgrade Your Project Workflow! — Get access to timeline
                automation, client tracking, and team insights for just
                $9/month.{" "}
              </AlertTitle>
            </Alert>
          </div>
          <div className="space-y-10">
            <MetricCards />
            <TaskBoard />
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
