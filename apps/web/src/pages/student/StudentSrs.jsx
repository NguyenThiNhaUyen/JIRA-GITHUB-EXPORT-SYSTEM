import { FileText } from "lucide-react";

// Components UI
import { Card } from "../../components/ui/Card.jsx";

// Shared Components
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";

// Local Components
import { SrsProjectHistory } from "./components/StudentSrs/SrsProjectHistory.jsx";
import { UploadSrsCard } from "./components/StudentSrs/UploadSrsCard.jsx";
import { SrsTemplatesCard } from "./components/StudentSrs/SrsTemplatesCard.jsx";
import { SubmitSrsModal } from "./components/StudentSrs/SubmitSrsModal.jsx";

// Hooks
import { useStudentSrs } from "./hooks/useStudentSrs.js";

export default function StudentSrsPage() {
    const {
        loadingProjects,
        myGroups,
        isModalOpen,
        setIsModalOpen,
        selectedProject,
        setSelectedProject,
        file,
        setFile,
        version,
        setVersion,
        isFinal,
        setIsFinal,
        isSubmitting,
        handleUpload
    } = useStudentSrs();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            <PageHeader 
                title="Quản lý Tài liệu SRS" 
                subtitle="Nộp và theo dõi trạng thái phê duyệt tài liệu Đặc tả Yêu cầu phần mềm (IEEE 29148 Standard)." 
                breadcrumb={["Sinh viên", "SRS Center"]} 
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
                <div className="xl:col-span-2 space-y-10">
                    {loadingProjects ? (
                        <div className="space-y-10">
                            {[1, 2].map(i => <Skeleton key={i} className="h-56 rounded-[56px]" />)}
                        </div>
                    ) : myGroups.length === 0 ? (
                        <Card className="rounded-[64px] border-4 border-dashed border-gray-100 bg-white/50 p-24 text-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                <FileText size={64} className="text-gray-200 group-hover:text-teal-400 transition-colors" />
                            </div>
                            <p className="text-sm font-black text-gray-300 uppercase tracking-[0.4em] leading-relaxed group-hover:text-gray-400 transition-colors">Chưa có thông tin dự án <br/>để tải hồ sơ SRS lên hệ thống</p>
                        </Card>
                    ) : (
                        myGroups.map((g, index) => (
                            <SrsProjectHistory key={g.id} project={g} index={index} />
                        ))
                    )}
                </div>

                <div className="space-y-10 xl:sticky xl:top-8 animate-in slide-in-from-right-12 duration-700">
                    <UploadSrsCard onOpenModal={() => setIsModalOpen(true)} />
                    <SrsTemplatesCard />
                </div>
            </div>

            <SubmitSrsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                myGroups={myGroups}
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                version={version}
                setVersion={setVersion}
                isFinal={isFinal}
                setIsFinal={setIsFinal}
                file={file}
                setFile={setFile}
                isSubmitting={isSubmitting}
                onUpload={handleUpload}
            />
        </div>
    );
}
