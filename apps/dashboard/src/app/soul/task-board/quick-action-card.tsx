"use client";

import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface QuickActionCardProps {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt?: string;
  dialog?: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickActionCard({
  title,
  description,
  iconSrc,
  iconAlt,
  dialog,
  isOpen,
  onOpenChange,
}: QuickActionCardProps) {
  const content = (
    <Card className="border-accent-foreground/10 bg-background/50 text-foreground shadow-transparent transition hover:border-border hover:bg-background/70">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/40 bg-muted/80">
          <img
            src={iconSrc}
            alt={iconAlt ?? ""}
            className="h-8 w-8 object-contain"
            loading="lazy"
            width={24}
            height={24}
          />
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight">{title}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (!dialog) {
    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{content}</DialogTrigger>
      {dialog}
    </Dialog>
  );
}
