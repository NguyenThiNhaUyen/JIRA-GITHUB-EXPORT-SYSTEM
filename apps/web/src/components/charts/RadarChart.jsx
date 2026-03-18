// GroupRadarChart â€” So sĂ¡nh hiá»‡u suáº¥t cĂ¡c nhĂ³m trong lá»›p há»c
import {
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

const GROUP_COLORS = [
    "#14b8a6", // teal-500
    "#6366f1", // indigo-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#10b981", // emerald-500
];

/**
 * GroupRadarChart
 * @param {Array} data - Array of { groupName, commits, srsDone, teamSize, githubLinked, jiraLinked }
 */
export function GroupRadarChart({ data = [] }) {
    // Normalise raw values to 0â€“100 so they are comparable on the same scale
    const maxValues = {
        commits: Math.max(...data.map((d) => d.commits), 1),
        srsDone: Math.max(...data.map((d) => d.srsDone), 1),
        teamSize: Math.max(...data.map((d) => d.teamSize), 1),
        githubLinked: 1,
        jiraLinked: 1,
    };

    // Build recharts-friendly data: one object per axis
    const radarData = [
        { axis: "Commits", fullMark: 100 },
        { axis: "SRS Done", fullMark: 100 },
        { axis: "Team Size", fullMark: 100 },
        { axis: "GitHub", fullMark: 100 },
        { axis: "Jira", fullMark: 100 },
    ];

    // For each group add its normalised score to each axis object
    const enriched = radarData.map((row, i) => {
        const keys = ["commits", "srsDone", "teamSize", "githubLinked", "jiraLinked"];
        const key = keys[i];
        const obj = { ...row };
        data.forEach((g) => {
            obj[g.groupName] = Math.round((g[key] / maxValues[key]) * 100);
        });
        return obj;
    });

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                </svg>
                <p className="text-sm">Chá»n lá»›p há»c Ä‘á»ƒ xem biá»ƒu Ä‘á»“ so sĂ¡nh nhĂ³m</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={320}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={enriched}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                {data.map((group, index) => (
                    <Radar
                        key={group.groupName}
                        name={group.groupName}
                        dataKey={group.groupName}
                        stroke={GROUP_COLORS[index % GROUP_COLORS.length]}
                        fill={GROUP_COLORS[index % GROUP_COLORS.length]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                        dot={{ r: 3, fill: GROUP_COLORS[index % GROUP_COLORS.length] }}
                    />
                ))}
                <Legend
                    wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    formatter={(value) => <span style={{ color: "#374151", fontWeight: 500 }}>{value}</span>}
                />
                <Tooltip
                    contentStyle={{
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        fontSize: 12,
                    }}
                    formatter={(value, name) => [`${value} / 100`, name]}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
}

export default GroupRadarChart;

