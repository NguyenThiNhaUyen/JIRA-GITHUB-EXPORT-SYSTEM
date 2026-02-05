import React from "react";
import { Card, CardContent } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { ChevronRight, Users, GitBranch, CheckCircle2, Clock, XCircle, Crown } from "lucide-react";

export default function CourseCard({ course, group, onSelect }) {
    const getStatusBadge = (status) => {
        const variants = {
            APPROVED: {
                icon: CheckCircle2,
                text: "Đã duyệt",
                className: "bg-green-100 text-green-700 border-green-300"
            },
            PENDING: {
                icon: Clock,
                text: "Chờ duyệt",
                className: "bg-yellow-100 text-yellow-700 border-yellow-300"
            },
            REJECTED: {
                icon: XCircle,
                text: "Từ chối",
                className: "bg-red-100 text-red-700 border-red-300"
            },
        };
        return variants[status] || variants.PENDING;
    };

    const statusBadge = getStatusBadge(group?.linksStatus);
    const StatusIcon = statusBadge.icon;

    return (
        <Card
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer border-2 hover:border-orange-400 bg-white"
            onClick={() => onSelect(course.id)}
        >
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{course.code}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.name}</p>
                        {group && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
                                    <span className="font-medium flex-shrink-0">{group.groupName}</span>
                                    <span className="text-gray-400 flex-shrink-0">•</span>
                                    <span className="text-orange-600 font-medium truncate" title={group.topic}>
                                        {group.topic || "Chưa chọn"}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center flex-wrap">
                                    <Badge
                                        variant={group.role === "LEADER" ? "default" : "outline"}
                                        className={`text-xs flex items-center gap-1 ${group.role === "LEADER"
                                            ? "bg-orange-600 text-white"
                                            : "border-gray-300 text-gray-700"
                                            }`}
                                    >
                                        {group.role === "LEADER" && <Crown className="w-3 h-3" />}
                                        {group.role === "LEADER" ? "Nhóm trưởng" : "Thành viên"}
                                    </Badge>
                                    <Badge className={`text-xs flex items-center gap-1 ${statusBadge.className}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusBadge.text}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>

                {group && (
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Nhóm</p>
                                <p className="text-sm font-semibold text-gray-900">{group.teamMembers?.length || 0} thành viên</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Commit gần nhất</p>
                                <p className="text-sm font-semibold text-gray-900">{new Date(group.lastCommit).toLocaleDateString("vi-VN")}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
