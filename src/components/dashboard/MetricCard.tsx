import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  variant = "default",
}: MetricCardProps) {
  const isPositive = change && change > 0;
  
  const variantStyles = {
    default: "bg-card",
    primary: "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl",
            variant === "primary" && "bg-primary/20 text-primary",
            variant === "success" && "bg-success/20 text-success",
            variant === "warning" && "bg-warning/20 text-warning",
            variant === "default" && "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
