/**
 * shared/StatusBadge.jsx
 * ────────────────────────────────────────────────────────
 * Reusable status badge component for consistent rendering
 * across Admin, Lecturer, and Student UIs.
 *
 * Usage:
 *   <StatusBadge type="srs" value="FINAL" />
 *   <StatusBadge type="link" value="APPROVED" />
 *   <StatusBadge type="active" value="ACTIVE" />
 *   <StatusBadge type="alert" value="high" />
 * ────────────────────────────────────────────────────────
 */
import { LINK_STATUS, SRS_STATUS, ACTIVE_STATUS, ALERT_SEVERITY } from "./permissions.js";

const TYPE_MAP = {
    link: LINK_STATUS,
    srs: SRS_STATUS,
    active: ACTIVE_STATUS,
    alert: ALERT_SEVERITY,
};

export function StatusBadge({ type, value, className = "" }) {
    const map = TYPE_MAP[type] || {};
    const cfg = map[value] || map[Object.keys(map)[0]];
    if (!cfg) return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider bg-gray-100 text-gray-500 border-gray-200 ${className}`}>{value || "—"}</span>;

    return (
        <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${cfg.cls} ${className}`}>
            {cfg.label || value}
        </span>
    );
}

/**
 * StatusDot — small colored dot for inline use
 * <StatusDot type="link" value="APPROVED" />
 */
export function StatusDot({ type, value }) {
    const map = TYPE_MAP[type] || {};
    const cfg = map[value];
    return (
        <span className={`inline-block w-2 h-2 rounded-full ${cfg?.dot || "bg-gray-400"}`} />
    );
}
