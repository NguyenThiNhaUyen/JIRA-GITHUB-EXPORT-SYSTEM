import { FileText, FileDown, Upload, Target, Activity, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import { useGetProjects } from "../../features/projects/hooks/useProjects.js";
import { useGetProjectSrs, useSubmitSrs } from "../../features/srs/hooks/useSrs.js";
import { useState } from "react";

// Components UI
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { PageHeader } from "../../components/shared/PageHeader.jsx";
import { StatusBadge } from "../../components/shared/Badge.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";
import { Modal } from "../../components/ui/interactive.jsx";
import { InputField, SelectField } from "../../components/shared/FormFields.jsx";
import { RefreshCw, Check, AlertCircle } from "lucide-react";

export default function StudentSrsPage() {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const { data: projectsData, isLoading: loadingProjects } = useGetProjects();
    const myGroups = projectsData?.items || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState("");
    const [file, setFile] = useState(null);
    const [version, setVersion] = useState("1.0.0");
    const [isFinal, setIsFinal] = useState(false);

    const submitSrsMutation = useSubmitSrs();

    const handleUpload = () => {
        if (!selectedProject) return showError("Vui lòng chọn dự án");
        if (!file) return showError("Vui lòng chọn file tài liệu");

        submitSrsMutation.mutate({ 
            projectId: selectedProject, 
            file,
            version,
            isFinal
        }, {
            onSuccess: () => {
                success("Đã nộp tài liệu SRS thành công!");
                setIsModalOpen(false);
                setFile(null);
                setSelectedProject("");
            },
            onError: () => showError("Nộp thất bại. Vui lòng thử lại.")
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader 
                title="Tài liệu SRS" 
                subtitle="Nộp và theo dõi trạng thái phê duyệt tài liệu Đặc tả Yêu cầu phần mềm (SRS)." 
                breadcrumb={["Sinh viên", "SRS"]} 
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-10">
                    {loadingProjects ? (
                        <div className="space-y-6">
                            {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-[40px]" />)}
                        </div>
                    ) : myGroups.length === 0 ? (
                        <Card className="rounded-[40px] border-0 bg-white p-24 text-center shadow-xl shadow-slate-200/50">
                            <FileText size={64} className="text-gray-200 mx-auto mb-8 opacity-40" />
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] opacity-80">Chưa có thông tin dự án để tải hồ sơ SRS</p>
                        </Card>
                    ) : (
                        myGroups.map((g, index) => (
                            <SrsProjectHistory key={g.id} project={g} index={index} />
                        ))
                    )}
                </div>

                <div className="space-y-8">
                    <Card className="rounded-[48px] border-0 bg-gradient-to-br from-slate-900 to-teal-950 text-white p-12 shadow-2xl shadow-teal-950/20 sticky top-8">
                        <div className="w-16 h-16 rounded-[28px] bg-white/10 flex items-center justify-center mb-8 shadow-inner"><Upload size={24}/></div>
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Hoàn tất tài liệu?</h4>
                        <p className="text-[11px] text-teal-200 font-bold leading-relaxed mb-10 uppercase tracking-widest opacity-80">Vui lòng kiểm tra định dạng .pdf (IEEE 29148). Mọi thay đổi đều được ghi vết theo phiên bản.</p>
                        <Button 
                            className="w-full h-16 bg-white text-teal-900 hover:bg-teal-50 rounded-[24px] font-black uppercase tracking-[0.2em] border-0 shadow-2xl transition-all hover:scale-105 active:scale-95"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Nộp ngay bây giờ
                        </Button>
                    </Card>
                    
                    <Card className="rounded-[40px] border-0 bg-white p-10 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-[20px] bg-indigo-50 flex items-center justify-center text-indigo-600"><Target size={20}/></div>
                            <h4 className="font-black text-gray-800 uppercase tracking-widest text-xs">Phòng mẫu SRS</h4>
                        </div>
                        <ul className="space-y-6">
                            <li className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600 transition-colors">IEEE Std 29148-2018 (.PDF)</span>
                                <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all"><FileDown size={14}/></Button>
                            </li>
                            <li className="flex items-center justify-between group cursor-pointer opacity-50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-teal-600 transition-colors">Software Requirements Spec (.DOCX)</span>
                                <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-teal-50 text-teal-600 rounded-xl transition-all"><FileDown size={14}/></Button>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nộp tài liệu SRS mới" size="md">
                <div className="space-y-6">
                    <SelectField label="Dự án" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
                        <option value="">Chọn dự án nộp bài</option>
                        {myGroups.map(p => <option key={p.id} value={p.id}>{p.name} - {p.course?.code}</option>)}
                    </SelectField>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Phiên bản" value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" />
                        <SelectField label="Loại nộp" value={isFinal ? "final" : "draft"} onChange={e => setIsFinal(e.target.value === "final")}>
                            <option value="draft">Bản nháp (Draft)</option>
                            <option value="final">Bản chính thức (Final)</option>
                        </SelectField>
                    </div>

                    <div 
                        className={`p-10 border-2 border-dashed rounded-[32px] text-center group cursor-pointer transition-all ${file ? 'border-teal-500 bg-teal-50/30' : 'border-teal-100 bg-teal-50/10 hover:bg-teal-50/30'}`}
                        onClick={() => document.getElementById('srs-file-input').click()}
                    >
                        <input id="srs-file-input" type="file" className="hidden" onChange={e => setFile(e.target.files[0])} />
                        <div className={`w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 ${file ? 'bg-teal-600 text-white' : 'bg-white text-teal-600'}`}>
                            {file ? <Check size={24}/> : <Upload size={24}/>}
                        </div>
                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{file ? file.name : "Chọn hoặc Kéo thả file"}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Định dạng hỗ trợ: PDF"}</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                        <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] text-gray-400">Hủy</Button>
                        <Button 
                            onClick={handleUpload} 
                            disabled={submitSrsMutation.isPending || !file || !selectedProject} 
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-12 px-10 font-black uppercase tracking-widest shadow-xl shadow-teal-100 disabled:opacity-50"
                        >
                            {submitSrsMutation.isPending ? <RefreshCw className="animate-spin mr-2" size={14}/> : null} Gửi nộp bài
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function SrsProjectHistory({ project, index }) {
    const { data: srsList = [], isLoading } = useGetProjectSrs(project.id);
    
    if (isLoading) return <Skeleton className="h-48 rounded-[40px]" />;

    return (
        <Card className="rounded-[48px] border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden animate-in fade-in slide-up duration-500" style={{ animationDelay: `${index * 200}ms` }}>
            <CardHeader className="p-10 border-b border-gray-50 flex flex-row items-center justify-between bg-gray-50/30">
                <div className="space-y-1.5">
                    <CardTitle className="text-lg font-black uppercase tracking-tighter text-gray-800 leading-none">{project.name}</CardTitle>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none">Nhóm hồ sơ SRS hiện tại</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-teal-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Activity size={14} className="text-teal-600" />
                        <span className="text-[10px] font-black text-teal-700 uppercase tracking-widest">{srsList.length} PHIÊN BẢN</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-gray-50/50">
                {srsList.length === 0 ? (
                    <div className="p-20 text-center">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic opacity-60">Dự án chưa có bản nộp đặc tả nào</p>
                    </div>
                ) : srsList.map((rpt, idx) => (
                    <div key={rpt.id} className="p-10 flex items-center justify-between hover:bg-gray-50/40 transition-all group">
                        <div className="flex gap-8 items-center">
                            <div className="w-14 h-14 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-inner group-hover:bg-teal-50 group-hover:text-teal-600 transition-all">
                                <FileText size={24}/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-4">
                                    <p className="text-base font-black text-gray-800 uppercase tracking-widest">Version {rpt.version || (idx + 1).toFixed(1)}</p>
                                    <StatusBadge status={rpt.status === 'FINAL' ? 'success' : 'warning'} label={rpt.status === 'FINAL' ? 'Đã duyệt' : 'Đang xử lý'} />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                    <Clock size={12} /> {new Date(rpt.submittedAt || rpt.createdAt).toLocaleString("vi-VN")}
                                </div>
                                {rpt.feedback && (
                                    <div className="mt-4 p-4 bg-indigo-50/50 rounded-[20px] max-w-lg border border-indigo-100/50">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 opacity-70">Phản hồi từ GV:</p>
                                        <p className="text-xs font-bold text-indigo-900 line-clamp-2">{rpt.feedback}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {rpt.fileUrl && (
                            <Button 
                                variant="outline" 
                                className="rounded-[20px] h-12 px-6 text-[10px] font-black uppercase tracking-widest border-slate-100 text-slate-400 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-100 shadow-sm transition-all active:scale-95" 
                                onClick={() => window.open(rpt.fileUrl, '_blank')}
                            >
                                <FileDown size={16} className="mr-2"/> Tải tài liệu
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
