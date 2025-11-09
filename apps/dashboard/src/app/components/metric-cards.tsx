import { Users, DollarSign, Activity, ShoppingCart } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function MetricCards() {
  const metrics = [
    {
      title: "Create New Task",
      desc: "Subtitle will be here",
      icon: DollarSign,
    },
    {
      title: "Create New Project",
      desc: "Subtitle will be here",
      icon: Users,
    },
    {
      title: "Create New Folder",
      desc: "Subtitle will be here",
      icon: ShoppingCart,
    },
    {
      title: "Active Sessions",
      desc: "Subtitle will be here",
      icon: Activity,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ title, desc, icon: Icon }) => (
        <Card
          key={title}
          className="border-border/60 bg-background/50 text-foreground shadow-none"
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80">
              <Icon className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">{title}</div>
              <p className="text-md text-muted-foreground">{desc}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
