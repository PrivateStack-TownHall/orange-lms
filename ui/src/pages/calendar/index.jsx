import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CircleDot, ClipboardList } from "lucide-react";

import usePopupStore from "@/app/store/popupStore";
import { useBreadcrumbs } from "@/hooks";
import CalendarService from "@/services/modules/calendar.service";
import LoadingPage from "@/components/ui/loading/LoadingPage";
import PageHeader from "@/components/ui/page/PageHeader";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
};

const CalendarPage = () => {
  const breadcrumbs = useBreadcrumbs();
  const { openError } = usePopupStore();
  const [month, setMonth] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");

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
        setEvents(response.data || []);
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
  const { start, end } = monthRange(month);
  const leadingDays = start.getDay();
  const cells = Array.from({ length: leadingDays + end.getDate() }, (_, index) => index - leadingDays + 1);
  const title = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (loading && !events.length) return <LoadingPage title="Loading Calendar..." />;

  return (
    <div className="min-h-screen space-y-4 bg-[var(--color-background)] p-4">
      <PageHeader breadcrumbs={breadcrumbs} title="Calendar" description="Meetings and task deadlines across your classes." />
      <section className="rounded-sm border border-gray-200 bg-[var(--color-surface)] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-sm border border-gray-200 p-2 hover:bg-gray-50"><ChevronLeft size={18} /></button>
            <h2 className="min-w-44 text-center text-lg font-semibold text-[var(--color-text)]">{title}</h2>
            <button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-sm border border-gray-200 p-2 hover:bg-gray-50"><ChevronRight size={18} /></button>
          </div>
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="rounded-sm border border-gray-200 px-3 py-2 text-sm">
            <option value="">All classes</option>
            {classOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-7 border-l border-t border-gray-200">
          {DAYS.map((day) => <div key={day} className="border-b border-r border-gray-200 bg-gray-50 p-2 text-xs font-semibold text-[var(--color-text-muted)]">{day}</div>)}
          {cells.map((day, index) => {
            const dayEvents = day > 0 ? events.filter((event) => new Date(event.date).getDate() === day) : [];
            return <div key={index} className="min-h-28 border-b border-r border-gray-200 p-2">
              {day > 0 && <p className="text-xs font-medium text-[var(--color-text-muted)]">{day}</p>}
              <div className="mt-1 space-y-1">{dayEvents.map((event) => <Link key={event.id} to={event.detailUrl} className={`block truncate rounded-sm px-2 py-1 text-xs font-medium ${event.type === "Meeting" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}><span className="mr-1 inline-block align-text-bottom">{event.type === "Meeting" ? <CircleDot size={11} /> : <ClipboardList size={11} />}</span>{event.title}</Link>)}</div>
            </div>;
          })}
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;
