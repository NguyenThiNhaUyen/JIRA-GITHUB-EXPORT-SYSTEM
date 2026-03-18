import { useMemo, useState } from "react";
import { useGetAlerts, useResolveAlert } from "@/features/system/hooks/useAlerts.js";
import { useMyCourses } from "@/features/dashboard/hooks/useDashboard.js";
import { useToast } from "@/components/ui/Toast.jsx";

export function useAlertActions() {
  const { success, error: showError } = useToast();
  const [filter, setFilter] = useState("open");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [remindedIds, setRemindedIds] = useState(() => {
    const saved = localStorage.getItem('reminded_alerts');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const { data: alertsData, isLoading, refetch } = useGetAlerts({ pageSize: 100 });
  const { mutate: resolveMutate, isPending: resolving } = useResolveAlert();
  const { data: coursesData = [] } = useMyCourses();

  const allGroups = useMemo(() => {
    const groups = [];
    (coursesData || []).forEach(c => {
      (c.projects || []).forEach(g => {
        groups.push({ ...g, courseCode: c.code || c.name });
      });
    });
    return groups;
  }, [coursesData]);

  const now = useMemo(() => Date.now(), []);

  const alertsList = alertsData?.items || [];

  const filtered = useMemo(() => {
    return alertsList.filter(a => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        (a.groupName || "").toLowerCase().includes(q) ||
        (a.targetName || "").toLowerCase().includes(q) ||
        (a.message || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filter === 'resolved') return a.status === 'RESOLVED';
      if (filter === 'all') return true; // Truly All
      if (filter === 'open') return !a.status || a.status === 'OPEN';

      const severity = (a.severity || "").toUpperCase();
      const isOpen = !a.status || a.status === 'OPEN';
      return isOpen && severity === filter.toUpperCase();
    });
  }, [alertsList, filter, search]);

  const selectedAlert = useMemo(() => {
    if (!selectedId && filtered.length > 0) return filtered[0];
    return filtered.find(a => String(a.id) === String(selectedId)) || (filtered.length > 0 ? filtered[0] : null);
  }, [filtered, selectedId]);

  const handleResolve = (id) => {
    resolveMutate(id, {
      onSuccess: () => {
        success("Đã xử lý cảnh báo");
        refetch();
      },
      onError: (err) => showError(err.message || "Không thể giải quyết cảnh báo")
    });
  };

  const handleRemind = (alert) => {
    const newReminded = new Set([...remindedIds, alert.id]);
    setRemindedIds(newReminded);
    localStorage.setItem('reminded_alerts', JSON.stringify([...newReminded]));
    success(`Đã gửi nhắc nhở đến ${alert.targetName || alert.groupName || 'nhóm'}`);
  };

  return {
    filter, setFilter,
    search, setSearch,
    selectedId, setSelectedId,
    remindedIds, setRemindedIds,
    isAlertModalOpen, setIsAlertModalOpen,
    alertsList, filtered, selectedAlert,
    isLoading, resolving, refetch,
    allGroups,
    handleResolve, handleRemind,
    now
  };
}






