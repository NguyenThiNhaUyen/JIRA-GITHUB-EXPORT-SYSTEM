import React from "react";
import { Badge } from "../ui/badge.jsx";

export default function TeamMembersTable({ members }) {
    if (!members || members.length === 0) {
        return <p className="text-sm text-gray-500 text-center py-3">Chưa có thành viên nào</p>;
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-orange-50 border-b border-orange-200">
                    <tr>
                        <th className="text-left px-4 py-3 font-semibold text-orange-900">MSSV</th>
                        <th className="text-left px-4 py-3 font-semibold text-orange-900">Họ tên</th>
                        <th className="text-left px-4 py-3 font-semibold text-orange-900">Email</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {members.map((member) => (
                        <tr
                            key={member.studentId}
                            className={`hover:bg-gray-50 transition-colors ${member.isLeader ? "bg-orange-50/30" : ""}`}
                        >
                            <td className="px-4 py-3 font-mono text-xs text-gray-900">
                                {member.studentCode}
                                {member.isLeader && (
                                    <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-700 border-orange-300">
                                        Nhóm trưởng
                                    </Badge>
                                )}
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                            <td className="px-4 py-3 text-gray-600 text-xs">{member.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
