"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";
interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const ToastContext = React.createContext<{ toast: (message: string, variant?: ToastVariant) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);

  const toast = React.useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++counter.current;
    setItems((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:left-auto sm:items-end" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-md border bg-card px-4 py-3 text-sm shadow-lg",
              t.variant === "success" ? "border-success/40" : "border-destructive/40",
            )}
          >
            {t.variant === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-destructive" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}
