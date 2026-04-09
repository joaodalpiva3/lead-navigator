"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TEMPERATURAS = ["Fervendo", "Quente", "Morno", "Frio"] as const;

const REVENUE_RANGES = [
  "Até R$ 10 mil",
  "De R$ 10 mil a R$ 50 mil",
  "De R$ 50 mil a R$ 100 mil",
  "De R$ 100 mil a R$ 500 mil",
  "Acima de R$ 500 mil por mês",
] as const;

const EVENTO_COMPRA = [
  { value: "Compra Aprovada", label: "Compra Aprovada" },
  { value: "Compra Reembolsada", label: "Compra Reembolsada" },
] as const;

const FUNNEL_FLAGS = [
  { param: "preencheu_pesquisa", label: "Preencheu pesquisa" },
  { param: "entrou_grupo", label: "Entrou no grupo" },
  { param: "agente_liberado", label: "Agente liberado" },
  { param: "recebeu_pv", label: "Recebeu PV" },
  { param: "recebeu_analise", label: "Análise Instagram" },
] as const;

const POINTS_MIN = 0;
const POINTS_MAX = 100;
const POINTS_STEP = 5;

function RangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200" />
        <div
          className="absolute h-1.5 rounded-full bg-blue-500"
          style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= valueMax) onChangeMin(v);
          }}
          className="absolute inset-x-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= valueMin) onChangeMax(v);
          }}
          className="absolute inset-x-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span className="font-semibold text-gray-600 tabular-nums">{valueMin} pts</span>
        <span>arraste para ajustar</span>
        <span className="font-semibold text-gray-600 tabular-nums">
          {valueMax === max ? `${max}+` : `${valueMax} pts`}
        </span>
      </div>
    </div>
  );
}

function CheckboxItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
      />
      <span className="text-[13px] text-gray-700">{label}</span>
    </label>
  );
}

function FilterButton({
  label,
  activeCount,
  children,
}: {
  label: string;
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium
            transition-all whitespace-nowrap cursor-pointer
            ${
              activeCount > 0
                ? "bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100"
                : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }
          `}
        >
          {label}
          {activeCount > 0 && (
            <Badge className="h-4.5 min-w-4.5 rounded-full px-1 flex items-center justify-center text-[10px] bg-blue-600 text-white">
              {activeCount}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2.5">
        {children}
      </PopoverContent>
    </Popover>
  );
}

export function LeadsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function getArrayParam(key: string): string[] {
    const val = searchParams.get(key);
    return val ? val.split(",") : [];
  }

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function toggleArrayValue(key: string, value: string) {
    const current = getArrayParam(key);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length > 0 ? next.join(",") : null });
  }

  function toggleFlag(param: string) {
    const current = searchParams.get(param);
    updateParams({ [param]: current === "true" ? null : "true" });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("temperatura");
    params.delete("revenue_range");
    params.delete("evento_compra");
    params.delete("min_tempo");
    params.delete("min_points");
    params.delete("max_points");
    params.delete("page");
    FUNNEL_FLAGS.forEach((f) => params.delete(f.param));
    router.push(`?${params.toString()}`, { scroll: false });
    setPointsMin(POINTS_MIN);
    setPointsMax(POINTS_MAX);
  }

  const selectedTemps = getArrayParam("temperatura");
  const selectedRevenue = getArrayParam("revenue_range");
  const selectedEvento = getArrayParam("evento_compra");
  const minTempo = searchParams.get("min_tempo") || "";
  const activeFlags = FUNNEL_FLAGS.filter(
    (f) => searchParams.get(f.param) === "true"
  );

  const urlMinPts = searchParams.get("min_points");
  const urlMaxPts = searchParams.get("max_points");
  const hasPointsFilter = urlMinPts !== null || urlMaxPts !== null;

  const [pointsMin, setPointsMin] = useState(
    urlMinPts ? Number(urlMinPts) : POINTS_MIN
  );
  const [pointsMax, setPointsMax] = useState(
    urlMaxPts ? Number(urlMaxPts) : POINTS_MAX
  );

  useEffect(() => {
    setPointsMin(urlMinPts ? Number(urlMinPts) : POINTS_MIN);
    setPointsMax(urlMaxPts ? Number(urlMaxPts) : POINTS_MAX);
  }, [urlMinPts, urlMaxPts]);

  const commitPoints = useCallback(
    (newMin: number, newMax: number) => {
      const isDefault = newMin === POINTS_MIN && newMax === POINTS_MAX;
      updateParams({
        min_points: isDefault ? null : String(newMin),
        max_points: isDefault ? null : String(newMax),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  const totalActive =
    selectedTemps.length +
    selectedRevenue.length +
    selectedEvento.length +
    activeFlags.length +
    (minTempo ? 1 : 0) +
    (hasPointsFilter ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Filter buttons row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Temperatura */}
        <FilterButton label="Temperatura" activeCount={selectedTemps.length}>
          <div className="space-y-1">
            {TEMPERATURAS.map((t) => (
              <CheckboxItem
                key={t}
                label={t}
                checked={selectedTemps.includes(t)}
                onChange={() => toggleArrayValue("temperatura", t)}
              />
            ))}
          </div>
        </FilterButton>

        {/* Faturamento */}
        <FilterButton label="Faturamento" activeCount={selectedRevenue.length}>
          <div className="space-y-1">
            {REVENUE_RANGES.map((r) => (
              <CheckboxItem
                key={r}
                label={r}
                checked={selectedRevenue.includes(r)}
                onChange={() => toggleArrayValue("revenue_range", r)}
              />
            ))}
          </div>
        </FilterButton>

        {/* Evento de compra */}
        <FilterButton
          label="Evento de compra"
          activeCount={selectedEvento.length}
        >
          <div className="space-y-1">
            {EVENTO_COMPRA.map((s) => (
              <CheckboxItem
                key={s.value}
                label={s.label}
                checked={selectedEvento.includes(s.value)}
                onChange={() => toggleArrayValue("evento_compra", s.value)}
              />
            ))}
          </div>
        </FilterButton>

        {/* Etapas do funil */}
        <FilterButton label="Etapas do funil" activeCount={activeFlags.length}>
          <div className="space-y-1">
            {FUNNEL_FLAGS.map((f) => (
              <CheckboxItem
                key={f.param}
                label={f.label}
                checked={searchParams.get(f.param) === "true"}
                onChange={() => toggleFlag(f.param)}
              />
            ))}
          </div>
        </FilterButton>

        {/* Pontos de engajamento */}
        <FilterButton
          label="Pontos de engajamento"
          activeCount={hasPointsFilter ? 1 : 0}
        >
          <RangeSlider
            min={POINTS_MIN}
            max={POINTS_MAX}
            step={POINTS_STEP}
            valueMin={pointsMin}
            valueMax={pointsMax}
            onChangeMin={(v) => {
              setPointsMin(v);
              commitPoints(v, pointsMax);
            }}
            onChangeMax={(v) => {
              setPointsMax(v);
              commitPoints(pointsMin, v);
            }}
          />
        </FilterButton>

        {/* Tempo min assistido */}
        <FilterButton
          label="Tempo min assistido"
          activeCount={minTempo ? 1 : 0}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="0"
              value={minTempo}
              onChange={(e) =>
                updateParams({ min_tempo: e.target.value || null })
              }
              className="h-8 w-24 text-sm"
            />
            <span className="text-[13px] text-gray-500">minutos</span>
          </div>
        </FilterButton>

        {/* Limpar filtros */}
        {totalActive > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Active filter tags */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTemps.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-gray-200 gap-1 font-medium"
              onClick={() => toggleArrayValue("temperatura", t)}
            >
              {t}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedRevenue.map((r) => (
            <Badge
              key={r}
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-gray-200 gap-1 font-medium"
              onClick={() => toggleArrayValue("revenue_range", r)}
            >
              {r}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedEvento.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-gray-200 gap-1 font-medium"
              onClick={() => toggleArrayValue("evento_compra", s)}
            >
              {s}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {activeFlags.map((f) => (
            <Badge
              key={f.param}
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-gray-200 gap-1 font-medium"
              onClick={() => toggleFlag(f.param)}
            >
              {f.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          {hasPointsFilter && (
            <Badge
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-gray-200 gap-1 font-medium"
              onClick={() => {
                setPointsMin(POINTS_MIN);
                setPointsMax(POINTS_MAX);
                updateParams({ min_points: null, max_points: null });
              }}
            >
              Pontos: {pointsMin}–
              {pointsMax === POINTS_MAX ? `${POINTS_MAX}+` : pointsMax}
              <X className="h-3 w-3" />
            </Badge>
          )}
          {minTempo && (
            <Badge
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-gray-200 gap-1 font-medium"
              onClick={() => updateParams({ min_tempo: null })}
            >
              Min. {minTempo}min
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
