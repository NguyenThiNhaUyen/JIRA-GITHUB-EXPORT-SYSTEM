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
          console.log("[SignalR] Received notification:", notification);
          info?.(notification.message || "Bạn có thông báo mới", { title: "Thông báo" });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        });

        try {
            await connection.start();
            if (isMounted) console.log("[SignalR] Connected");
        } catch (err) {
            if (isMounted) console.error("[SignalR] Connection Error: ", err);
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
    
    // Admin paths
    if (path.includes("/admin/courses")) return "Quản lý Lớp học";
    if (path.includes("/admin/semesters")) return "Quản lý Học kỳ";
    if (path.includes("/admin/subjects")) return "Quản lý Môn học";
    if (path.includes("/admin/reports")) return "Báo cáo Admin";
    if (path === "/admin") return "Tổng quan";

    // Lecturer paths
    if (path.includes("/lecturer/group")) return "Chi tiết Nhóm";
    if (path.includes("/lecturer/course")) return "Quản lý Nhóm";
    if (path.includes("/lecturer/srs")) return "Báo cáo SRS";
    if (path.includes("/lecturer/analytics")) return "Phân tích Lớp";
    if (path.includes("/lecturer/contributions")) return "Theo dõi Đóng góp";
    if (path.includes("/lecturer/reports")) return "Trung tâm Báo cáo";
    if (path === "/lecturer") return "Tổng quan Giảng viên";

    // Student paths
    if (path.includes("/student/course")) return "Khóa học của tôi";
    if (path.includes("/student/my-project")) return "Dự án của tôi";
    if (path.includes("/student/project/")) return "Chi tiết Dự án";
    if (path.includes("/student/contribution")) return "Đóng góp cá nhân";
    if (path.includes("/student/alerts")) return "Thông báo & Cảnh báo";
    if (path.includes("/student/srs")) return "Tài liệu SRS";
    if (path === "/student") return "Tổng quan Sinh viên";

    return "Dashboard";
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
    <header className="h-[88px] px-8 flex items-center justify-between border-b border-gray-100 bg-white relative z-20">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {!isRootPath && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 font-black transition-all"
          >
            ←
          </button>
        )}
        <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
          {getPageTitle()}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* SEARCH */}
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm nhanh..."
            className="w-72 pl-12 pr-6 py-3 bg-gray-50 border border-transparent rounded-[20px] text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-teal-100 focus:ring-4 focus:ring-teal-50/50 outline-none transition-all"
          />
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-2xl transition-all ${showNotifications ? 'bg-teal-50 text-teal-600' : 'hover:bg-gray-50 text-gray-400'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[400px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/20 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thông báo mới</span>
                {unreadCount > 0 && <span className="text-[9px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase">{unreadCount} Chưa đọc</span>}
              </div>

              <div className="max-h-[450px] overflow-y-auto divide-y divide-gray-50">
                {isLoading && (
                  <div className="py-12 text-center text-gray-300 text-[10px] font-black uppercase tracking-widest">Đang đồng bộ...</div>
                )}
                {notifications.map((notif, idx) => (
                  <div 
                    key={notif.id || `notif-${idx}`} 
                    className={`px-8 py-6 hover:bg-gray-50/50 transition-all cursor-pointer group ${!notif.isRead ? 'bg-teal-50/10' : ''}`}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest opacity-60">{notif.type}</span>
                        <span className="text-[9px] font-bold text-gray-300 uppercase">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="font-black text-gray-800 text-sm leading-tight group-hover:text-teal-600 transition-colors uppercase tracking-tight">{notif.title}</p>
                    <p className="text-xs text-gray-500 font-bold mt-1.5 leading-relaxed">{notif.content}</p>
                    
                    {notif.projectName && (
                      <div className="flex items-center gap-2 mt-3 bg-white border border-gray-100 px-3 py-1.5 rounded-lg inline-flex">
                          <Check size={10} className="text-teal-500"/>
                          <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Dự án: {notif.projectName}</span>
                      </div>
                    )}

                    {notif.type === 'INVITATION' && !notif.isRead && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAccept(notif.invitationId, notif.id); }}
                          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-teal-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDecline(notif.invitationId, notif.id); }}
                          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-400 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && !isLoading && (
                  <div className="py-16 text-center">
                      <Bell size={32} className="mx-auto text-gray-100 mb-4"/>
                      <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Không có thông báo mới</p>
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
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-[20px] transition-all ${showUserMenu ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-teal-100">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
                <p className="text-[10px] font-black text-gray-800 uppercase tracking-tight leading-none">{user?.name || "Tài khoản"}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{user?.role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-4 w-64 bg-white rounded-[28px] shadow-2xl shadow-gray-200/50 border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/20">
                <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-400 font-bold truncate mt-1">{user?.email}</p>
              </div>
              <div className="p-2">
                  <button className="flex items-center gap-3 w-full px-6 py-4 hover:bg-gray-50 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all">
                    <Settings size={16} /> Cài đặt hồ sơ
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-6 py-4 text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
