import React from "react";
import { Users, Upload, Eye, RefreshCcw, CheckCheck, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard.jsx";

export function SrsStats({ stats }) {
  const items = [
    {
      label: "Tá»•ng nhĂ³m",
      value: stats.totalGroups,
      icon: Users,
      variant: "default",
    },
    {
      label: "ÄĂ£ ná»™p",
      value: stats.submitted,
      icon: Upload,
      variant: "info",
    },
    {
      label: "Äang review",
      value: stats.review,
      icon: Eye,
      variant: "indigo",
    },
    {
      label: "Cáº§n chá»‰nh sá»­a",
      value: stats.revision,
      icon: RefreshCcw,
      variant: "warning",
    },
    {
      label: "Final",
      value: stats.final,
      icon: CheckCheck,
      variant: "success",
    },
    {
      label: "QuĂ¡ háº¡n",
      value: stats.overdue,
      icon: AlertTriangle,
      variant: "danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <StatsCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          variant={item.variant}
        />
      ))}
    </div>
  );
}

