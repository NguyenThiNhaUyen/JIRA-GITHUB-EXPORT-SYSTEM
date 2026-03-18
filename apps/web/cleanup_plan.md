# Cleanup Plan - RECONSTRUCTED & COMPLETED

- [x] **P0: Web Root Junk** (Xong - Đã xóa mọi file rác)
- [x] **P1: Các file "Chết" hoàn toàn** (Xong - Đã xóa mọi file không caller)
- [x] **P2: Services & Centralized Hooks** (Xong - Đã fix caller & xóa)
- [x] **P3: Duplicate Layouts** (Xong - Đã review & xóa bản cũ)
- [x] **P4: Orphan Charts** (Xong - Đã xóa các chart không dùng)

### Đợt 0: Web Root Junk (Xong)
- `build-error2.txt`, `build.log`, `build_errors.txt`, `build_errors_utf8.txt`, `build_success.log`, `eslint-results.txt`
- `build_check.js`
- `vite.config.js` (Redundant, keeping `vite.config.ts`)

### Đợt 1: Dead Code in `src/` (Xong)
- `src/mock/db.js`
- `src/shared/` folder
- `src/utils/dateRange.js`
- `src/components/drag/` folder
- `src/layouts/MainLayout.jsx` (Redundant with `src/components/layout/MainLayout.jsx`)

### Đợt 2: Refactoring & Cleanup (Xong)
- `src/services/` folder
- `src/hooks/use-api.js` (Migration confirmed complete for all callers)
- `CreateCourseModal.jsx` (Migrated to `useCreateCourse` hook)
- `useLecturerDashboard.js` (Migrated to feature hooks)

### Đợt 3: Duplicate Layout Components (Xong)
- `src/components/layout/MainLayout.jsx`
- `src/components/layout/Topbar.jsx`
- `src/components/layout/Sidebar.jsx` (Confirming use of `TopHeader.jsx` in all major layouts)

### Đợt 4: Orphan Charts (Xong)
- `CodeChangesChart.jsx`, `HeatmapChart.jsx`, `PerformanceTrendsChart.jsx`
- Keeping `CfdChart.jsx`, `CycleTimeChart.jsx`, etc. as they are used in Lecturer Analytics.
