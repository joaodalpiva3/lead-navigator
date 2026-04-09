"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronsUpDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/lib/supabase/types";

export function CampaignSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Support multiple campaign IDs separated by comma
  const selectedIds = (searchParams.get("campaign") || "")
    .split(",")
    .filter(Boolean);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("move_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCampaigns(data);
          // Auto-select most recent if none selected
          if (selectedIds.length === 0 && data.length > 0) {
            updateCampaigns([data[0].id]);
          }
        }
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateCampaigns(ids: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    if (ids.length > 0) {
      params.set("campaign", ids.join(","));
    } else {
      params.delete("campaign");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  }

  function toggleCampaign(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((v) => v !== id)
      : [...selectedIds, id];
    updateCampaigns(next);
  }

  function getLabel(): string {
    if (selectedIds.length === 0) return "Selecionar campanha...";
    if (selectedIds.length === 1) {
      const c = campaigns.find((c) => c.id === selectedIds[0]);
      return c?.campaign_name || c?.id || "1 campanha";
    }
    return `${selectedIds.length} campanhas`;
  }

  function formatDates(c: Campaign) {
    if (!c.aula_1) return "";
    const d1 = new Date(c.aula_1).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    if (!c.aula_2) return d1;
    const d2 = new Date(c.aula_2).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
    return `${d1} — ${d2}`;
  }

  if (loading) {
    return (
      <div className="h-10 w-[280px] animate-pulse rounded-md bg-slate-200" />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between font-medium"
          disabled={isPending}
        >
          <span className="truncate">{getLabel()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar campanha..." />
          <CommandList>
            <CommandEmpty>Nenhuma campanha encontrada.</CommandEmpty>
            <CommandGroup>
              {campaigns.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <CommandItem
                    key={c.id}
                    value={c.campaign_name || c.id}
                    onSelect={() => toggleCampaign(c.id)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-slate-300",
                        isSelected && "bg-blue-600 border-blue-600"
                      )}
                    >
                      {isSelected && (
                        <Check className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {c.campaign_name || c.id}
                      </span>
                      {c.aula_1 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDates(c)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
