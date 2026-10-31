import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckSquare, Calendar, BarChart3, Users, FileText, Settings } from "lucide-react";

import NotificationService from "@/services/modules/notification.service";

const TYPE_ICON = {
  Task: CheckSquare,
  Meeting: Calendar,
  Assessment: BarChart3,
  Attendance: Users,
  Material: FileText,
  System: Settings,
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchData = async () => {
    try {
      const [listRes, summaryRes] = await Promise.all([
        NotificationService.getAll({ limit: 6 }),
        NotificationService.getSummary(),
      ]);
      setNotifications(listRes.data?.data || []);
      setUnread(summaryRes.data?.unread || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    await NotificationService.markAsRead(id);
    fetchData();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-[var(--color-surface-muted)] transition-all hover:scale-105"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-md border border-gray-200 bg-[var(--color-surface)] shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 p-3">
            <span className="font-semibold">Notifications</span>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-orange-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center p-6 text-center">
                <img
                  src="/document-inbox-notification.png"
                  alt=""
                  className="h-14 w-14 object-contain opacity-70"
                />
                <p className="mt-2 text-sm text-gray-500">
                  You're all caught up.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    className={`flex w-full gap-3 border-b border-gray-50 p-3 text-left transition hover:bg-gray-50 ${
                      !n.isRead ? "bg-orange-50/50" : ""
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-orange-100 text-orange-600">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="truncate text-xs text-gray-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
