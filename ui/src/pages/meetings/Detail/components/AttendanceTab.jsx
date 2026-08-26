import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, MinusCircle, Save } from "lucide-react";

import AttendanceService from "@/services/modules/attendance.service";

const STATUS_OPTIONS = ["Present", "Late", "Absent", "Excused"];

const STATUS_STYLE = {
  Present: "bg-green-100 text-green-700",
  Late: "bg-orange-100 text-orange-700",
  Absent: "bg-red-100 text-red-700",
  Excused: "bg-blue-100 text-blue-700",
};

const STATUS_ICON = {
  Present: CheckCircle2,
  Late: Clock,
  Absent: XCircle,
  Excused: MinusCircle,
};

/**
 * Attendance tab for a Meeting Detail page (Mentor/Admin view).
 * Lets the mentor mark every mentee's attendance for this meeting in one go.
 */
const AttendanceTab = ({ meetingId, mentees = [] }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await AttendanceService.getByMeeting(meetingId);
      setRecords(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meetingId) fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  if (loading) {
    return (
      <div className="rounded-sm border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Loading attendance...
      </div>
    );
  }

  const recordByUserId = Object.fromEntries(
    records.map((r) => [r.UserId, r]),
  );

  const summary = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = records.filter((r) => r.status === status).length;
    return acc;
  }, {});

  const handleMark = async (userId) => {
    const status = draft[userId];
    if (!status) return;

    try {
      setSaving(true);
      await AttendanceService.mark({ MeetingId: meetingId, UserId: userId, status });
      await fetchAttendance();
      setDraft((prev) => ({ ...prev, [userId]: undefined }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATUS_OPTIONS.map((status) => {
          const Icon = STATUS_ICON[status];
          return (
            <div
              key={status}
              className="rounded-sm border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={STATUS_STYLE[status].split(" ")[1]} />
                <span className="text-xs text-gray-500">{status}</span>
              </div>
              <p className="mt-1 text-xl font-bold">{summary[status] || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Mentee list */}
      <div className="overflow-hidden rounded-sm border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Mentee</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Check-in</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mentees.map((mentee) => {
              const existing = recordByUserId[mentee.id];

              return (
                <tr key={mentee.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{mentee.name}</p>
                    <p className="text-xs text-gray-500">{mentee.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {existing ? (
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-medium ${STATUS_STYLE[existing.status]}`}
                      >
                        {existing.status}
                      </span>
                    ) : (
                      <select
                        value={draft[mentee.id] || ""}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [mentee.id]: e.target.value }))
                        }
                        className="rounded-sm border border-gray-200 px-2 py-1 text-xs"
                      >
                        <option value="">Select status</option>
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {existing?.checkInAt
                      ? new Date(existing.checkInAt).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {!existing && (
                      <button
                        disabled={!draft[mentee.id] || saving}
                        onClick={() => handleMark(mentee.id)}
                        className="inline-flex items-center gap-1 rounded-sm bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save size={12} />
                        Save
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {mentees.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No mentees enrolled in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTab;
