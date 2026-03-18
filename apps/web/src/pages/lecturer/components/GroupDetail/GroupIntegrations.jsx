import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/Card.jsx";
import { LinkApprovalSection } from"@/components/shared/LinkApprovalSection.jsx";
import { Shield, GitBranch, BookOpen } from"lucide-react";

export function GroupIntegrations({ group, handleApproveLink, handleRejectLink }) {
 return (
 <Card className="border border-gray-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
 <CardHeader className="border-b border-gray-50 py-5 px-8">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><Shield size={20} /></div>
 <CardTitle className="text-base font-black text-gray-800">Tích hợp Kỹ thuật</CardTitle>
 </div>
 </CardHeader>
 <CardContent className="p-8 space-y-8">
 <LinkApprovalSection
 icon={<GitBranch size={16} className="text-gray-400" />}
 label="Repository GitHub"
 url={group.integration?.githubUrl}
 status={group.integration?.githubStatus}
 onApprove={handleApproveLink}
 onReject={handleRejectLink}
 />

 <div className="h-px bg-gray-50" />

 <LinkApprovalSection
 icon={<BookOpen size={16} className="text-gray-400" />}
 label="Dự án Jira Software"
 url={group.integration?.jiraUrl}
 status={group.integration?.jiraStatus}
 onApprove={handleApproveLink}
 onReject={handleRejectLink}
 />
 </CardContent>
 </Card>
 );
}






