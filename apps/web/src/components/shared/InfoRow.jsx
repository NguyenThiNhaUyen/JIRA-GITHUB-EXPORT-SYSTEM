export function InfoRow({ label, value }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-gray-400  block">{label}</label>
            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 shadow-inner">{value}</div>
        </div>
    );
}
