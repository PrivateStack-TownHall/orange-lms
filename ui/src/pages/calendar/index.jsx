import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Clock3,
  Filter,
  GraduationCap,
  X,
} from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import { useBreadcrumbs } from "@/hooks";
import CalendarService from "@/services/modules/calendar.service";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EVENT_TYPES = ["All", "Meeting", "Task"];
const monthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

const eventStyles = {
  Meeting: {
    chip: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    icon: CircleDot,
    label: "Meeting",
  },
  Task: {
    chip: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    icon: ClipboardList,
    label: "Task deadline",
  },
};

const formatEventDate = (date) => new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date(date));

const formatAgendaDate = (date) => new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
}).format(new Date(date));

const CalendarPage = () => {
  const breadcrumbs = useBreadcrumbs();
  const { openError } = usePopupStore();
  const [month, setMonth] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { start, end } = monthRange(month);
        const response = await CalendarService.getEvents({
          start: start.toISOString(),
          end: end.toISOString(),
          classId: classFilter || undefined,
        });
        const nextEvents = response.data || [];
        setEvents(nextEvents);
        setSelectedEvent((current) => nextEvents.find((event) => event.id === current?.id) || null);
      } catch (error) {
        openError({ title: "Load Failed", message: error?.response?.data?.message || "Failed to load calendar events." });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [month, classFilter, openError]);

  const classOptions = useMemo(
    () => [...new Map(events.map((event) => [event.ClassId, event.className])).entries()],
    [events],
  );
  const visibleEvents = useMemo(
    () => events.filter((event) => typeFilter === "All" || event.type === typeFilter),
    [events, typeFilter],
  );
  const agendaEvents = useMemo(() => visibleEvents.slice(0, 8), [visibleEvents]);
  const { start, end } = monthRange(month);
  const leadingDays = start.getDay();
  const cells = Array.from({ length: leadingDays + end.getDate() }, (_, index) => index - leadingDays + 1);
  const title = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedStyle = selectedEvent ? eventStyles[selectedEvent.type] : null;
  const SelectedIcon = selectedStyle?.icon;

  if (loading && !events.length) return <LoadingPage title="Loading Calendar..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <PageHeader breadcrumbs={breadcrumbs} title="Calendar" description="Meetings and task deadlines across your classes." />
      <section className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-sm border border-gray-200 p-2 hover:bg-gray-50"><ChevronLeft size={18} /></button>
            <h2 className="min-w-44 text-center text-lg font-semibold text-[var(--color-text)]">{title}</h2>
            <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-sm border border-gray-200 p-2 hover:bg-gray-50"><ChevronRight size={18} /></button>
            <button type="button" onClick={() => { setMonth(new Date()); setSelectedEvent(null); }} className="ml-1 rounded-sm border border-gray-200 px-2 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:bg-gray-50">Today</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 p-1" aria-label="Filter event type">
              <Filter size={14} className="ml-1 text-[var(--color-text-muted)]" />
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-sm px-2 py-1 text-xs font-medium ${typeFilter === type ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-text-muted)] hover:bg-white"}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="rounded-sm border border-gray-200 px-3 py-2 text-sm">
              <option value="">All classes</option>
              {classOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {DAYS.map((day) => <div key={day} className="border-b border-r border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-[var(--color-text-muted)]">{day}</div>)}
            {cells.map((day, index) => {
              const dayEvents = day > 0 ? visibleEvents.filter((event) => new Date(event.date).getDate() === day) : [];
              return <div key={index} className="min-h-28 border-b border-r border-gray-200 p-2">
                {day > 0 && <p className="text-xs font-medium text-[var(--color-text-muted)]">{day}</p>}
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => {
                    const style = eventStyles[event.type];
                    const Icon = style.icon;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className={`flex w-full items-center gap-1 truncate rounded-sm px-2 py-1 text-left text-xs font-medium ${style.chip} ${selectedEvent?.id === event.id ? "ring-2 ring-offset-1 ring-[var(--color-primary)]" : ""}`}
                      >
                        <Icon size={11} className="shrink-0" />
                        <span className="truncate">{event.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>;
            })}
          </div>
          <aside className="min-h-52 border border-gray-200 bg-gray-50 p-4 xl:min-h-full">
            {selectedEvent ? (
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-sm ${selectedEvent.type === "Meeting" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}><SelectedIcon size={17} /></span>
                    <p className="text-xs font-semibold uppercase text-[var(--color-text-muted)]">{selectedStyle.label}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedEvent(null)} className="rounded-sm p-1 text-[var(--color-text-muted)] hover:bg-white" aria-label="Close event details"><X size={17} /></button>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[var(--color-text)]">{selectedEvent.title}</h3>
                <div className="mt-5 space-y-3 text-sm text-[var(--color-text-muted)]">
                  <p className="flex gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" /><span>{formatEventDate(selectedEvent.date)}</span></p>
                  <p className="flex gap-2"><GraduationCap size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" /><span>{selectedEvent.className || "Class"}</span></p>
                  <p className="flex gap-2"><Clock3 size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" /><span>{selectedEvent.type === "Task" ? "Task deadline" : "Scheduled meeting"}</span></p>
                </div>
                <Link to={selectedEvent.detailUrl} className="mt-auto inline-flex items-center justify-center gap-2 rounded-sm bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90">
                  Open {selectedEvent.type} <ArrowUpRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <CalendarDays size={28} className="text-[var(--color-primary)]" />
                <h3 className="mt-3 font-semibold text-[var(--color-text)]">Select an event</h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">Choose a meeting or deadline to see its schedule and class.</p>
              </div>
            )}
          </aside>
        </div>
        <section className="mt-4 border-t border-gray-200 pt-4 xl:hidden" aria-label="Calendar agenda">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Month agenda</h3>
            <span className="text-xs text-[var(--color-text-muted)]">{visibleEvents.length} events</span>
          </div>
          {agendaEvents.length ? (
            <div className="mt-3 divide-y divide-gray-200 border-y border-gray-200">
              {agendaEvents.map((event) => {
                const style = eventStyles[event.type];
                const Icon = style.icon;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="flex w-full items-center gap-3 py-3 text-left hover:bg-gray-50"
                  >
                    <span className="w-10 text-xs font-semibold text-[var(--color-text-muted)]">{formatAgendaDate(event.date)}</span>
                    <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm ${event.type === "Meeting" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}><Icon size={14} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--color-text)]">{event.title}</span>
                      <span className="block truncate text-xs text-[var(--color-text-muted)]">{event.className || "Class"}</span>
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-[var(--color-text-muted)]" />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">No events match the selected filters this month.</p>
          )}
        </section>
      </section>
    </div>
  );
};

export default CalendarPage;
