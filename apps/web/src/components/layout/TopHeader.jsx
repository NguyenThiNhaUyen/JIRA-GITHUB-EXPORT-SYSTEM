import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Check,
  X
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  useGetMyPendingInvitations,
  useAcceptInvitation,
  useRejectInvitation
} from "../../features/projects/hooks/useInvitations.js";

import { useToast } from "../../components/ui/toast.jsx";

export function TopHeader() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState("");

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const isStudent = user?.role === "STUDENT";

  /* ---------------- API ---------------- */

  const { data: invitations = [], isLoading } = useGetMyPendingInvitations({
    enabled: isStudent
  });

  const { mutate: acceptMutate } = useAcceptInvitation();
  const { mutate: rejectMutate } = useRejectInvitation();

  /* ---------------- HANDLERS ---------------- */

  const handleAccept = (id) => {

    acceptMutate(id, {
      onSuccess: () => success("Đã chấp nhận lời mời nhóm"),
      onError: () => error("Không thể chấp nhận lời mời")
    });

  };

  const handleDecline = (id) => {

    rejectMutate(id, {
      onSuccess: () => success("Đã từ chối lời mời"),
      onError: () => error("Không thể từ chối lời mời")
    });

  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ---------------- CLICK OUTSIDE ---------------- */

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  /* ---------------- PAGE TITLE ---------------- */

  const TITLE_MAP = {
    "/admin/courses": "Quản lý Lớp học",
    "/admin/semesters": "Quản lý Học kỳ",
    "/admin/subjects": "Quản lý Môn học",
    "/admin/reports": "Báo cáo Admin"
  };

  const getPageTitle = () => {

    const path = location.pathname;

    for (const key in TITLE_MAP) {
      if (path.includes(key)) return TITLE_MAP[key];
    }

    if (path === "/admin") return "Tổng quan";
    if (path === "/lecturer") return "Tổng quan Giảng viên";

    return "Dashboard";

  };

  const isRootPath =
    location.pathname === "/admin" ||
    location.pathname === "/lecturer";

  const backPath =
    location.pathname.startsWith("/admin")
      ? "/admin"
      : location.pathname.startsWith("/lecturer")
      ? "/lecturer"
      : "/";

  const pendingCount = isStudent ? invitations.length : 0;

  /* ---------------- TIME FORMAT ---------------- */

  const formatTime = (dateStr) => {

    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);

    if (h < 1) return "Vừa xong";
    if (h < 24) return `${h} giờ trước`;

    return `${Math.floor(h / 24)} ngày trước`;

  };

  /* ---------------- UI ---------------- */

  return (

<header className="h-[88px] px-8 flex items-center justify-between border-b border-gray-100 bg-white relative z-20">

{/* LEFT */}

<div className="flex items-center gap-4">

{!isRootPath && (

<button
onClick={() => navigate(backPath)}
className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
>
←
</button>

)}

<h1 className="text-2xl font-bold text-gray-800">
{getPageTitle()}
</h1>

</div>

{/* RIGHT */}

<div className="flex items-center gap-5">

{/* SEARCH */}

<div className="relative hidden md:block">

<Search
className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
size={18}
/>

<input
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Tìm kiếm..."
className="w-64 pl-10 pr-4 py-2 bg-gray-50 rounded-full text-sm focus:ring-2 focus:ring-blue-100 outline-none"
/>

</div>

{/* NOTIFICATIONS */}

<div className="relative" ref={notificationRef}>

<button
onClick={() => setShowNotifications(!showNotifications)}
className="relative p-2 rounded-full hover:bg-gray-100"
>

<Bell size={20} />

{pendingCount > 0 && (

<span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
{pendingCount}
</span>

)}

</button>

{showNotifications && (

<div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border z-40">

<div className="px-4 py-3 border-b font-semibold">
{isStudent ? "Lời mời nhóm" : "Thông báo"}
</div>

<div className="max-h-[380px] overflow-y-auto">

{isLoading && (
<div className="py-8 text-center text-gray-400">
Đang tải...
</div>
)}

{!isLoading && invitations.length === 0 && (
<div className="py-8 text-center text-gray-400">
Không có thông báo mới
</div>
)}

{invitations.map((inv) => (

<div key={inv.id} className="px-4 py-3 border-b">

<p className="font-semibold text-sm">
{inv.projectName}
</p>

<p className="text-xs text-gray-500">
{inv.invitedByName} mời bạn tham gia
</p>

<p className="text-[10px] text-gray-400">
{formatTime(inv.createdAt)}
</p>

<div className="flex gap-2 mt-2">

<button
onClick={() => handleAccept(inv.id)}
className="flex items-center gap-1 text-xs bg-teal-600 text-white px-3 py-1 rounded"
>

<Check size={12} />
Đồng ý

</button>

<button
onClick={() => handleDecline(inv.id)}
className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1 rounded"
>

<X size={12} />
Từ chối

</button>

</div>

</div>

))}

</div>

</div>

)}

</div>

{/* USER MENU */}

<div className="relative" ref={userMenuRef}>

<button
onClick={() => setShowUserMenu(!showUserMenu)}
className="flex items-center gap-3"
>

<div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-700">

{(user?.name || "User").charAt(0).toUpperCase()}

</div>

<ChevronDown size={16} />

</button>

{showUserMenu && (

<div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border">

<div className="px-4 py-3 border-b">

<p className="font-bold text-sm">
{user?.name}
</p>

<p className="text-xs text-gray-500">
{user?.email}
</p>

</div>

<button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-50">

<Settings size={16} />
Cài đặt

</button>

<button
onClick={handleLogout}
className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50"
>

<LogOut size={16} />
Đăng xuất

</button>

</div>

)}

</div>

</div>

</header>

  );

}