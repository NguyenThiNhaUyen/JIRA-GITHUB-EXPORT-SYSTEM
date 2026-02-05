import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { ArrowLeft, Upload, Edit, Trash2, Crown, Users, FileText } from "lucide-react";
import LeaderControls from "./LeaderControls.jsx";
import TeamMembersTable from "./TeamMembersTable.jsx";

export default function GroupDetails({
    course,
    group,
    srsReports,
    availableTopics,
    onBack,
    onUpdateGroup,
    onSubmitLinks,
    onUploadSRS,
    onEditReport,
    onDeleteReport,
}) {
    const reports = srsReports[group.groupId] || [];
    const isLeader = group.role === "LEADER";

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={onBack} className="text-orange-600 hover:text-orange-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại danh sách môn học
            </Button>

            {/* Course & Group Header */}
            <Card className="border-orange-200">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl text-orange-900">
                                {course.code} - {course.name}
                            </CardTitle>
                            <p className="text-gray-600 mt-1">{course.lecturer}</p>
                            <div className="flex gap-2 mt-3">
                                <Badge variant={group.role === "LEADER" ? "default" : "outline"} className="bg-orange-600 text-white flex items-center gap-1.5">
                                    {group.role === "LEADER" && <Crown className="w-3.5 h-3.5" />}
                                    {group.role === "LEADER" ? "Trưởng nhóm" : "Thành viên"}
                                </Badge>
                                <Badge variant="outline" className="border-orange-300 text-orange-700">
                                    {group.groupName}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Chủ đề project</p>
                            <p className="font-semibold text-gray-900">{group.topic || "Chưa chọn"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">GitHub Repository</p>
                            {group.githubUrl ? (
                                <a
                                    href={group.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:underline text-sm font-medium"
                                >
                                    {group.githubUrl.split("/").pop()}
                                </a>
                            ) : (
                                <p className="text-sm text-gray-400">Chưa submit</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Jira Project</p>
                            {group.jiraUrl ? (
                                <a
                                    href={group.jiraUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:underline text-sm font-medium"
                                >
                                    Xem Jira
                                </a>
                            ) : (
                                <p className="text-sm text-gray-400">Chưa submit</p>
                            )}
                        </div>
                    </div>

                    {/* Leader Controls */}
                    {isLeader && (
                        <LeaderControls
                            group={group}
                            topics={availableTopics}
                            onUpdate={onUpdateGroup}
                            onSubmit={onSubmitLinks}
                        />
                    )}

                    {/* Team Members Table */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-orange-600" />
                                Thành viên nhóm
                            </h4>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                {group.teamMembers?.length || 0} thành viên
                            </Badge>
                        </div>
                        <TeamMembersTable members={group.teamMembers} />
                    </div>

                    {/* SRS Reports Section */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                Báo cáo SRS
                            </h4>
                            <Button size="sm" onClick={onUploadSRS} className="bg-orange-600 hover:bg-orange-700 text-white">
                                <Upload className="w-4 h-4 mr-1" />
                                Upload SRS
                            </Button>
                        </div>

                        {reports.length > 0 ? (
                            <div className="space-y-2">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">Version {report.version}</p>
                                            <p className="text-sm text-gray-600">{report.note}</p>
                                            <p className="text-xs text-gray-500">
                                                Submitted: {new Date(report.submittedAt).toLocaleDateString("vi-VN")}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => onEditReport(report)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-600 hover:text-red-700"
                                                onClick={() => onDeleteReport(group.groupId, report.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-6">Chưa có SRS report nào</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
