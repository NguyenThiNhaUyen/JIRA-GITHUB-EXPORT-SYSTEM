import { useState, useRef, useEffect, useMemo } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
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
  useGetNotifications,
  useMarkAsRead
} from "../../features/notifications/hooks/useNotifications.js";
import {
  useAcceptInvitation,
  useRejectInvitation
} from "../../features/projects/hooks/useInvitations.js";

import { useToast } from "../../components/ui/toast.jsx";

export function TopHeader() {

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error, info } = useToast();
  const queryClient = useQueryClient();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState("");

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const isStudent = user?.role === "STUDENT";

  /* ---------------- API ---------------- */

  const { data: notificationData = { items: [] }, isLoading } = useGetNotifications({
    pageSize: 10
  });
  const notifications = notificationData.items || [];
  const { mutate: markAsReadMutate } = useMarkAsRead();

  const { mutate: acceptMutate } = useAcceptInvitation();
  const { mutate: rejectMutate } = useRejectInvitation();

  /* ---------------- HANDLERS ---------------- */

  const handleAccept = (invitationId, notificationId) => {
    acceptMutate(invitationId, {
      onSuccess: () => {
        success("Đã chấp nhận lời mời nhóm");
        markAsReadMutate(notificationId);
      },
      onError: () => error("Không thể chấp nhận lời mời")
    });
  };

  const handleDecline = (invitationId, notificationId) => {
    rejectMutate(invitationId, {
      onSuccess: () => {
        success("Đã từ chối lời mời");
        markAsReadMutate(notificationId);
      },
      onError: () => error("Không thể từ chối lời mời")
    });
  };

  const handleMarkRead = (id) => {
    markAsReadMutate(id);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /* ---------------- SIGNALR REAL-TIME ---------------- */

  useEffect(() => {
    if (!user) return;

    const BASE_URL = (import.meta.env.VITE_API_URL ?? "https://jira-github-export-system.onrender.com/api")
      .replace(/\/api$/, ""); // Strip /api suffix → Hub nằm ở root, không ở /api
    
    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/notificationHub`, {
        // BE v2.1: Hub tại /notificationHub (root, không có /api prefix)
        accessTokenFactory: () => localStorage.getItem("accessToken") || localStorage.getItem("token")
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    let isStopped = false;

    const startConnection = async () => {
      if (connection.state !== "Disconnected") return;
      try {
        await connection.start();
        if (!isStopped) {
          console.log("[SignalR] Connected to NotificationHub");
        }
      } catch (err) {
        if (!isStopped && err.name !== "AbortError") {
          console.error("[SignalR] Connection failed: ", err);
        }
      }
    };

    connection.on("ReceiveNotification", (notification) => {
      console.log("[SignalR] Received notification:", notification);
      
      // Hiển thị toast nhanh
      info?.(notification.message || "Bạn có thông báo mới", { title: "Thông báo" });
      
      // Invalidate query để cập nhật danh sách và unreadCount
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    startConnection();

    return () => {
      isStopped = true;
      connection.stop();
    };
  }, [user, queryClient, info]);

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
    const now = useRef(Date.now()).current;

    const formatTime = (dateStr) => {
        const diff = now - new Date(dateStr).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return "Vừa xong";
        if (h < 24) return `${h} giờ trước`;
        return `${Math.floor(h / 24)} ngày trước`;
    };

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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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

{unreadCount > 0 && (

<span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
{unreadCount}
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

{notifications.map((notif, idx) => (

<div 
  key={notif.id || `notif-${idx}`} 
  className={`px-4 py-3 border-b hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
>

<p className="font-semibold text-sm">
{notif.title}
</p>

<p className="text-xs text-gray-600 mt-1">
{notif.content}
</p>

{notif.projectName && (
  <p className="text-[11px] text-teal-600 font-medium mt-1">
    Dự án: {notif.projectName}
  </p>
)}

<p className="text-[10px] text-gray-400 mt-2">
{formatTime(notif.createdAt)}
</p>

{notif.type === 'INVITATION' && !notif.isRead && (
<div className="flex gap-2 mt-3">

<button
onClick={(e) => {
  e.stopPropagation();
  handleAccept(notif.invitationId, notif.id);
}}
className="flex items-center gap-1 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-teal-700 transition-colors"
>

<Check size={12} />
Đồng ý

</button>

<button
onClick={(e) => {
  e.stopPropagation();
  handleDecline(notif.invitationId, notif.id);
}}
className="flex items-center gap-1 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
>

<X size={12} />
Từ chối

</button>

</div>
)}

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