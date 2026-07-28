"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SubscriptionWithDetails } from "@/types";
import { getPlataformaByValue, getPlatformColorClasses } from "@/lib/constants";

interface ExpirationCalendarProps {
  subscriptions: SubscriptionWithDetails[];
}

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function getColorClass(days: number): string {
  if (days <= 0) return "bg-red-500";
  if (days <= 2) return "bg-red-400";
  if (days <= 5) return "bg-amber-500";
  return "bg-emerald-500";
}

function getColorText(days: number): string {
  if (days <= 0) return "text-red-500 dark:text-red-400";
  if (days <= 2) return "text-red-400 dark:text-red-300";
  if (days <= 5) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-500 dark:text-emerald-400";
}

function getClientName(sub: SubscriptionWithDetails): string {
  return (sub.clients as { nombre_completo?: string })?.nombre_completo ?? "Sin cliente";
}

interface DayData {
  uniqueClients: { name: string; days: number }[];
  subs: SubscriptionWithDetails[];
  worstDays: number;
}

export function ExpirationCalendar({ subscriptions }: ExpirationCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((sub) => {
      const fecha = new Date(sub.fecha_vencimiento);
      fecha.setHours(0, 0, 0, 0);
      return fecha >= today && fecha <= oneMonthLater;
    });
  }, [subscriptions]);

  const expirationsByDay = useMemo(() => {
    const map = new Map<number, DayData>();
    for (const sub of filteredSubs) {
      const fecha = new Date(sub.fecha_vencimiento);
      if (fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear) {
        const day = fecha.getDate();
        const days = Math.ceil((fecha.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const clientName = getClientName(sub);

        if (!map.has(day)) {
          map.set(day, { uniqueClients: [], subs: [], worstDays: days });
        }
        const entry = map.get(day)!;
        entry.subs.push(sub);

        if (!entry.uniqueClients.some((c) => c.name === clientName)) {
          entry.uniqueClients.push({ name: clientName, days });
        }

        if (days < entry.worstDays) {
          entry.worstDays = days;
        }
      }
    }
    return map;
  }, [filteredSubs, currentMonth, currentYear]);

  const prevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectedData = selectedDay ? expirationsByDay.get(selectedDay) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <h3 className="text-sm font-bold text-foreground">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>
        <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-[10px] font-semibold text-muted-foreground uppercase py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const data = expirationsByDay.get(day);
          const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
          const isSelected = day === selectedDay;
          const hasEvents = data && data.uniqueClients.length > 0;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`relative min-h-[3rem] flex flex-col items-center justify-start rounded-lg text-xs transition-all duration-150 pt-1 ${
                isSelected
                  ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                  : isToday
                    ? "bg-accent font-bold text-foreground"
                    : "text-foreground hover:bg-accent/50"
              }`}
            >
              <span className={`${isToday && !isSelected ? "text-primary" : ""}`}>{day}</span>
              {hasEvents && (
                <div className="w-full px-0.5 mt-0.5 space-y-0.5">
                  {data!.uniqueClients.slice(0, 2).map((client, idx) => (
                    <div
                      key={idx}
                      className={`text-[7px] leading-tight text-center truncate rounded px-0.5 py-px ${getColorClass(client.days)} text-white font-medium`}
                    >
                      {client.name.split(" ")[0]}
                    </div>
                  ))}
                  {data!.uniqueClients.length > 2 && (
                    <div className="text-[7px] text-center text-muted-foreground font-medium">
                      +{data!.uniqueClients.length - 2}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day details */}
      {selectedDay && selectedData && (
        <div className="rounded-xl border border-border/50 bg-background/50 p-3 space-y-2 animate-fade-in-up">
          <p className="text-xs font-semibold text-muted-foreground">
            {selectedDay} de {MONTH_NAMES[currentMonth]}
          </p>
          {selectedData.subs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin vencimientos este día</p>
          ) : (
            <div className="space-y-1.5">
              {selectedData.subs.map((sub) => {
                const days = Math.ceil((new Date(sub.fecha_vencimiento).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const plataforma = sub.accounts ? getPlataformaByValue(sub.accounts.plataforma) : null;
                const colorKey = plataforma?.color ?? "slate";

                return (
                  <div key={sub.id} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${getColorClass(days)}`} />
                      <span className="text-xs font-medium text-foreground truncate">{sub.nombre_perfil}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getPlatformColorClasses(colorKey).dot}`} />
                      <span className="text-[10px] text-muted-foreground">
                        {getClientName(sub)}
                      </span>
                      <span className={`text-[10px] font-bold tabular-nums ${getColorText(days)}`}>
                        {days <= 0 ? "Vence hoy" : `${days}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
