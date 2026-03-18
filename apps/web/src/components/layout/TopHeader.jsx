import { useState, useRef, useEffect } from "react";
import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  Check,
  X
} from "lucide-react";

import { useAuth } from "@/context/AuthContext.jsx";
import {
  useGetNotifications,
  useMarkAsRead
} from "@/features/notifications/hooks/useNotifications.js";
import {
  useAcceptInvitation,
  useRejectInvitation
} from "@/features/projects/hooks/useInvitations.js";

import { useToast } from "@/components/ui/Toast.jsx";

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

    let connection = null;
    let isMounted = true;

    const startSignalR = async () => {
        const BASE_URL = (import.meta.env.VITE_API_URL ?? "https://jira-github-export-system.onrender.com/api")
          .replace(/\/api$/, ""); 
        
        connection = new HubConnectionBuilder()
          .withUrl(`${BASE_URL}/notificationHub`, {
            accessTokenFactory: () => localStorage.getItem("accessToken") || localStorage.getItem("token"),
            skipNegotiation: false,
            transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Warning)
          .build();

        connection.on("ReceiveNotification", (notification) => {
          if (!isMounted) return;
          info?.(notification.message || "Bạn có thông báo mới", { title: "Thông báo" });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        });

        try {
            await connection.start();
        } catch (err) {
            // SignalR Connection Error
        }
    };

    startSignalR();

    return () => {
      isMounted = false;
      if (connection) {
        connection.stop().catch(err => console.warn("[SignalR] Stop error:", err));
      }
    };
  }, [user, queryClient]); // Removed 'info' to prevent unnecessary restarts

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- PAGE TITLE ---------------- */

  const getPageTitle = () => {
    const path = location.pathname;
    const PAGE_TITLES = [
      // Admin
      { match: "/admin/courses", title: "Quản lý Lớp học" },
      { match: "/admin/semesters", title: "Quản lý Học kỳ" },
      { match: "/admin/subjects", title: "Quản lý Môn học" },
      { match: "/admin/reports", title: "Báo cáo Admin" },
      { match: "/admin/lecturer-assignment", title: "Phân công Giảng viên" },
      { match: "/admin/workload", title: "Khối lượng Giảng dạy" },
      { match: "/admin/users", title: "Quản lý Tài khoản" },
      { match: "/admin", title: "Tổng quan Quản trị" },

      // Lecturer
      { match: "/lecturer/group/", title: "Chi tiết Nhóm" },
      { match: "/lecturer/course/", title: "Quản lý Nhóm" },
      { match: "/lecturer/srs", title: "Báo cáo SRS" },
      { match: "/lecturer/analytics", title: "Phân tích Lớp" },
      { match: "/lecturer/contributions", title: "Theo dõi Đóng góp" },
      { match: "/lecturer/reports", title: "Trung tâm Báo cáo" },
      { match: "/lecturer", title: "Tổng quan Giảng viên" },

      // Student
      { match: "/student/course", title: "Khóa học của tôi" },
      { match: "/student/my-project", title: "Dự án của tôi" },
      { match: "/student/project/", title: "Chi tiết Dự án" },
      { match: "/student/contribution", title: "Đóng góp cá nhân" },
      { match: "/student/alerts", title: "Thông báo & Cảnh báo" },
      { match: "/student/srs", title: "Tài liệu SRS" },
      { match: "/student", title: "Tổng quan Sinh viên" },
    ];

    return PAGE_TITLES.find(p => path.includes(p.match))?.title ?? "Dashboard";
  };

  const isRootPath = location.pathname === "/admin" || location.pathname === "/lecturer" || location.pathname === "/student";
  const backPath = location.pathname.startsWith("/admin") ? "/admin" : location.pathname.startsWith("/lecturer") ? "/lecturer" : location.pathname.startsWith("/student") ? "/student" : "/";
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Vừa xong";
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  return (
    <header className="h-[72px] px-6 flex items-center justify-between border-b border-gray-100 bg-white relative z-20">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {!isRootPath && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all flex items-center justify-center"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* SEARCH */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-2xl text-sm text-gray-600 placeholder-gray-300 focus:bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-50 outline-none transition-all"
          />
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-2xl transition-all ${showNotifications ? 'bg-teal-50 text-teal-600' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 z-40 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Thông báo</span>
                {unreadCount > 0 && <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{unreadCount} chưa đọc</span>}
              </div>

              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                {isLoading && (
                  <div className="py-10 text-center text-gray-400 text-sm">Đang tải...</div>
                )}
                {notifications.map((notif, idx) => (
                  <div 
                    key={notif.id || `notif-${idx}`} 
                    className={`px-6 py-4 hover:bg-gray-50/70 transition-all cursor-pointer group ${!notif.isRead ? 'bg-teal-50/20' : ''}`}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-teal-600">{notif.type}</span>
                        <span className="text-xs text-gray-400">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm leading-snug group-hover:text-teal-700 transition-colors">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.content}</p>
                    
                    {notif.projectName && (
                      <div className="flex items-center gap-1.5 mt-2 bg-white border border-gray-100 px-2.5 py-1 rounded-lg inline-flex w-fit">
                          <Check size={10} className="text-teal-500"/>
                          <span className="text-xs text-gray-400">Dự án: {notif.projectName}</span>
                      </div>
                    )}

                    {notif.type === 'INVITATION' && !notif.isRead && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(notif.invitationId, notif.id); }}
                          className="text-xs font-semibold bg-teal-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-teal-700 transition-all"
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDecline(notif.invitationId, notif.id); }}
                          className="text-xs font-semibold bg-white border border-gray-200 text-gray-500 px-3.5 py-1.5 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && !isLoading && (
                  <div className="py-14 text-center">
                      <Bell size={28} className="mx-auto text-gray-200 mb-3"/>
                      <p className="text-sm text-gray-400">Không có thông báo mới</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER MENU */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl transition-all ${showUserMenu ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-md">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || "Tài khoản"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 z-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
              </div>
              <div className="p-2">
                  <button className="flex items-center gap-2.5 w-full px-4 py-3 hover:bg-gray-50 rounded-2xl text-sm text-gray-600 transition-all">
                    <Settings size={15} /> Cài đặt hồ sơ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl text-sm transition-all"
                  >
                    <LogOut size={15} /> Đăng xuất
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}







