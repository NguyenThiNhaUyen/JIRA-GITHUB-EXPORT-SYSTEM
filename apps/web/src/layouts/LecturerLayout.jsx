import { TopHeader } from "../components/layout/TopHeader.jsx";

export default function LecturerLayout({ children }) {
    return (
        <div className="h-screen flex relative overflow-hidden bg-teal-50">
            {/* Wavy Background Elements (same as Admin) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg
                    className="absolute w-full h-full opacity-30"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                    viewBox="0 0 1440 800"
                >
                    <path
                        fill="#d1fae5" // teal-100
                        d="M0 200c144 144 336 144 480 0s336-144 480 0 336 144 480 0v600H0V200z"
                    />
                    <path
                        fill="#a7f3d0" // teal-200
                        opacity="0.5"
                        d="M0 400c144 144 336 144 480 0s336-144 480 0 336 144 480 0v400H0V400z"
                    />
                </svg>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="flex-1 flex flex-col z-10 overflow-hidden relative">
                {/* Edaca Style Inner Container */}
                <div className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col h-full overflow-y-auto w-full max-w-[1600px] mx-auto">
                    {/* Main White Card Enclosure (Edaca style overall wrapping) */}
                    <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-xl flex-1 flex flex-col overflow-hidden border border-white/40">
                        {/* Header / Topbar extracted component */}
                        <TopHeader />

                        {/* Sub-page content */}
                        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-transparent">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
