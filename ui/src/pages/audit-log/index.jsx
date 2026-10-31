import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

import PageHeader from "@/components/ui/page/PageHeader";
import LoadingPage from "@/components/ui/loading/LoadingPage";

import AuditLogService from "@/services/modules/auditLog.service";
import useBreadcrumbs from "@/hooks/useBreadcrumbs";

const ACTION_STYLE = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-600",
  ROLE_CHANGE: "bg-amber-100 text-amber-700",
  STATUS_CHANGE: "bg-amber-100 text-amber-700",
};

const ACTIONS = [
  "All",
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "ROLE_CHANGE",
];

const AuditLog = () => {
  const breadcrumbs = useBreadcrumbs();

  const [logs, setLogs] = useState([]);
  const [overview, setOverview] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [action, setAction] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1, actionFilter = action) => {
    try {
      setLoading(true);
      const [logsRes, overviewRes] = await Promise.all([
        AuditLogService.getAll({ page, limit: 10, action: actionFilter }),
        AuditLogService.getOverview(),
      ]);
      setLogs(logsRes.data?.data || []);
      setPagination(
        logsRes.data?.pagination || { page: 1, totalPages: 1, total: 0 },
      );
      setOverview(overviewRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, action);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action]);

  if (loading && logs.length === 0) {
    return <LoadingPage title="Loading audit log..." />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="Audit Log"
        description="Track and review all important actions performed in the system."
      />

      {overview && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <div className="col-span-2 rounded-sm border border-gray-200 bg-white p-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-orange-500" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="mt-1 text-xl font-bold">{overview.total}</p>
          </div>
          {Object.entries(overview.byAction || {}).map(([action, count]) => (
            <div
              key={action}
              className="rounded-sm border border-gray-200 bg-white p-4"
            >
              <span className="text-xs text-gray-500">{action}</span>
              <p className="mt-1 text-xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a}
            onClick={() => setAction(a)}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition ${
              action === a
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            } border border-gray-200`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <img
              src="/secure-verified-shield.png"
              alt=""
              className="h-20 w-20 object-contain opacity-70"
            />
            <p className="mt-3 text-gray-500">No audit records found.</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{log.User?.name || "System"}</td>
                  <td className="px-4 py-3 text-xs">{log.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-1 text-xs font-medium ${ACTION_STYLE[log.action] || "bg-gray-100 text-gray-600"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.resource}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.resourceDetail || "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {log.ipAddress || "-"}
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
            {pagination.total} records)
          </span>
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(0, 8)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => fetchData(p, action)}
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

export default AuditLog;
