import React from "react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";
import { Settings, AlertCircle } from "lucide-react";

export default function LeaderControls({ group, topics, onUpdate, onSubmit }) {
    const handleTopicChange = (e) => {
        onUpdate(group.courseId, "topic", e.target.value);
    };

    const handleGithubChange = (e) => {
        onUpdate(group.courseId, "githubUrl", e.target.value);
    };

    const handleJiraChange = (e) => {
        onUpdate(group.courseId, "jiraUrl", e.target.value);
    };

    const handleSubmit = () => {
        onSubmit(group.courseId);
    };

    const isComplete = group.topic && group.githubUrl && group.jiraUrl;

    return (
        <div className="border-t border-orange-200 pt-4 mt-4">
            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Project Settings
                <Badge variant="outline" className="ml-auto text-xs bg-orange-100 text-orange-700 border-orange-300">
                    Leader Only
                </Badge>
            </h4>
            <div className="space-y-3 bg-orange-50/50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Topic <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={group.topic || ""}
                        onChange={handleTopicChange}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">-- Chọn topic --</option>
                        {topics.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub Repository URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        value={group.githubUrl || ""}
                        onChange={handleGithubChange}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="https://github.com/username/repo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jira Project URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        value={group.jiraUrl || ""}
                        onChange={handleJiraChange}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="https://yourteam.atlassian.net/browse/PROJECT"
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={!isComplete || group.linksStatus === "APPROVED"}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {group.linksStatus === "PENDING" ? "Nộp" : group.linksStatus === "APPROVED" ? "Đã duyệt" : "Gửi duyệt"}
                    </Button>
                    {group.linksStatus === "APPROVED" && (
                        <Badge className="bg-green-100 text-green-700">Giảng viên đã duyệt</Badge>
                    )}
                </div>
            </div>
        </div>
    );
}
