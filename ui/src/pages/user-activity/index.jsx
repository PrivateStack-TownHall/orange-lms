import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import UserActivityService from "@/services/modules/userActivity.service";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

const ACTIVITY_STYLE = {
  "Submitted Task": "bg-green-100 text-green-700",
  "Updated Submission": "bg-purple-100 text-purple-700",
  "Viewed Material": "bg-blue-100 text-blue-700",
  "Joined Meeting": "bg-sky-100 text-sky-700",
  "Joined Class": "bg-sky-100 text-sky-700",
  "Graded Submission": "bg-orange-100 text-orange-700",
  "Attendance Recorded": "bg-teal-100 text-teal-700",
  "Created Note": "bg-indigo-100 text-indigo-700",
  "Updated Profile": "bg-gray-100 text-gray-600",
  "Logged In": "bg-emerald-100 text-emerald-700",
  "Logged Out": "bg-gray-100 text-gray-600",
  "Viewed Submission": "bg-amber-100 text-amber-700",
};

const UserActivityLog = () => {
  const breadcrumbs = useBreadcrumbs();

  const [activities, setActivities] = useState([]);
  const [overview, setOverview] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const [listRes, overviewRes] = await Promise.all([
        UserActivityService.getAll({ page, limit: 10 }),
        UserActivityService.getOverview(),
      ]);
      setActivities(listRes.data?.data || []);
      setPagination(
        listRes.data?.pagination || { page: 1, totalPages: 1, total: 0 },
      );
      setOverview(overviewRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  if (loading && activities.length === 0) {
    return <LoadingPage title="Loading user activity..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="User Activity"
        description="Track user activities and learning interactions in the system."
      />

      {overview && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-orange-500" />
              <span className="text-xs text-gray-500">Total Activities</span>
            </div>
            <p className="mt-1 text-xl font-bold">{overview.total}</p>
          </div>
          {overview.topUsers?.slice(0, 3).map((u) => (
            <div
              key={u.name}
              className="rounded-sm border border-gray-200 bg-white p-4"
            >
              <span className="text-xs text-gray-500">{u.name}</span>
              <p className="mt-1 text-xl font-bold">{u.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <img
              src="/document-review-search.png"
              alt=""
              className="h-20 w-20 object-contain opacity-70"
            />
            <p className="mt-3 text-gray-500">No activity recorded yet.</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activities.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{a.User?.name || "-"}</td>
                  <td className="px-4 py-3 text-xs">{a.User?.role || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 text-xs font-medium ${ACTIVITY_STYLE[a.activity] || "bg-gray-100 text-gray-600"}`}
                    >
                      {a.activity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {a.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {a.class?.name || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} activities)
          </span>
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(0, 8)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => fetchData(p)}
                  className={`h-8 w-8 rounded-sm text-sm font-medium ${
                    pagination.page === p
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  } border border-gray-200`}
                >
                  {p}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityLog;
