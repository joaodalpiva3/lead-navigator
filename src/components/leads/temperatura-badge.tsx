"use client";

import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TEMPERATURA_CONFIG, type Temperatura } from "@/lib/constants";

interface TemperaturaBadgeProps {
  temperatura: string | null;
  className?: string;
}

export function TemperaturaBadge({ temperatura, className }: TemperaturaBadgeProps) {
  if (!temperatura) {
    return (
      <Badge variant="outline" className={className}>
        N/A
      </Badge>
    );
  }

  const config = TEMPERATURA_CONFIG[temperatura as Temperatura];
  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {temperatura}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} border-transparent font-medium ${className || ""}`}
    >
      {config.icon && <Flame className="mr-1 h-3 w-3" />}
      {temperatura}
    </Badge>
  );
}
