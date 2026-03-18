export const COURSE_CODES = ["SE1811", "SE1812", "SE1813", "SE1821", "SE1822", "IA1801", "AI1802"];

export const COURSE_STATUSES = {
    ACTIVE: { label: "Đang mở", variant: "success", text: "ACTIVE" },
    UPCOMING: { label: "Sắp mở", variant: "warning", text: "UPCOMING" },
    COMPLETED: { label: "Đã đóng", variant: "default", text: "COMPLETED" },
};

export const DEFAULT_COURSE_FORM = {
    code: "",
    name: "",
    description: "",
    subjectId: "",
    semesterId: "",
    lecturerId: "",
    room: "",
    startDate: "",
    endDate: "",
    minStudents: 10,
    maxStudents: 40,
    status: "ACTIVE",
};
