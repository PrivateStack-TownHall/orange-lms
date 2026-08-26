import { useEffect, useState } from "react";
import { CheckCheck, Bell, CheckSquare, Calendar, BarChart3, Users, FileText, Settings } from "lucide-react";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import NotificationService from "@/services/modules/notification.service";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

const TYPE_ICON = {
  Task: CheckSquare,
  Meeting: Calendar,
  Assessment: BarChart3,
  Attendance: Users,
  Material: FileText,
  System: Settings,
};

const FILTERS = ["All", "Unread", "Read"];

const Notifications = () => {
  const breadcrumbs = useBreadcrumbs();

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1, status = filter) => {
    try {
      setLoading(true);
      const res = await NotificationService.getAll({
        page,
        limit: 10,
        status: status === "All" ? undefined : status.toLowerCase(),
      });
      setNotifications(res.data?.data || []);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    fetchData(pagination.page, filter);
  };

  const handleMarkRead = async (id) => {
    await NotificationService.markAsRead(id);
    fetchData(pagination.page, filter);
  };

  if (loading && notifications.length === 0) {
    return <LoadingPage title="Loading notifications..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Notifications"
        description="Stay updated with your latest activities and learning updates."
        actions={
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        }
      />

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-sm px-4 py-2 text-sm font-medium transition ${
              filter === f
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            } border border-gray-200`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-sm border border-gray-200 bg-white">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <img
              src="/notification-bell-alert.png"
              alt=""
              className="h-20 w-20 object-contain opacity-70"
            />
            <p className="mt-3 text-gray-500">No notifications to show.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 transition ${
                    !n.isRead ? "bg-orange-50/40" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-orange-100 text-orange-600">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      <span className="shrink-0 text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 rounded-sm bg-white px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => fetchData(p, filter)}
                className={`h-8 w-8 rounded-sm text-sm font-medium ${
                  pagination.page === p
                    ? "bg-orange-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                } border border-gray-200`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
