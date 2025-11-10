"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    ({ title, description, variant = "default", duration = 4000 }: ToastOptions) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const nextToast: Toast = { id, title, description, variant };
      setToasts((current) => [...current, nextToast]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex flex-col gap-3">
        {toasts.map((current) => (
          <div
            key={current.id}
            className={cn(
              "pointer-events-auto flex w-80 items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur",
              current.variant === "destructive"
                ? "border-red-200/60 bg-red-50/90 text-red-900 dark:border-red-500/30 dark:bg-red-500/20 dark:text-white"
                : "border-slate-200/80 bg-white/90 text-slate-900 dark:border-white/10 dark:bg-sidebar dark:text-white"
            )}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold">{current.title}</p>
              {current.description ? (
                <p className="text-xs text-muted-foreground">{current.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10"
              onClick={() => dismiss(current.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
