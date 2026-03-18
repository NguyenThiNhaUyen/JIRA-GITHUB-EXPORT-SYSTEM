import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import '../../../widgets/app_top_header.dart';
import '../../../widgets/student_navigation.dart';
import '../../../providers/auth_provider.dart';
import '../../../services/student_service.dart';
import '../../../services/auth_service.dart';
import '../../../models/user.dart';

// ───────────────────────── MOCK DATA ─────────────────────────

const List<Map<String, dynamic>> _mockCourses = [];

const List<Map<String, dynamic>> _mockProjects = [];

const Map<String, dynamic> _mockProjectMetrics = {};

const List<Map<String, dynamic>> _mockAlerts = [];

const Map<String, dynamic> _mockSrsData = {};

const Map<String, Color> _srsStatusColors = {
  "SUBMITTED": Color(0xFF3B82F6),
  "UNDER_REVIEW": Color(0xFFF59E0B),
  "NEEDS_REVISION": Color(0xFFEF4444),
  "APPROVED": Color(0xFF10B981),
  "REJECTED": Color(0xFF64748B),
};

const Map<String, Color> _srsStatusBgColors = {
  "SUBMITTED": Color(0xFFEFF6FF),
  "UNDER_REVIEW": Color(0xFFFFFBEB),
  "NEEDS_REVISION": Color(0xFFFEF2F2),
  "APPROVED": Color(0xFFECFDF5),
  "REJECTED": Color(0xFFF8FAFC),
};

// ───────────────────────── UI HELPERS ─────────────────────────

Widget _buildBreadcrumb(BuildContext context, String currentTitle) {
  return Row(
    children: [
      InkWell(
        onTap: () => context.go('/student'),
        child: const Text('Sinh viên', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0F766E))),
      ),
      const SizedBox(width: 4),
      const Icon(Icons.chevron_right, size: 14, color: Color(0xFF94A3B8)),
      const SizedBox(width: 4),
      Text(currentTitle, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E293B))),
    ],
  );
}

Widget _buildSectionHeader(String title, String subtitle) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
      const SizedBox(height: 4),
      Text(subtitle, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
    ],
  );
}

Widget _buildSummaryCard(IconData icon, Color bgIcon, String label, String value) {
  return Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(color: const Color(0xFFF1F5F9)),
      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2))],
    ),
    child: Row(
      children: [
        Container(
          width: 44, height: 44,
          decoration: BoxDecoration(color: bgIcon, borderRadius: BorderRadius.circular(14)),
          child: Icon(icon, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF64748B))),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF1E293B))),
            ],
          ),
        ),
      ],
    ),
  );
}

Widget _buildEmptyState(IconData icon, String title, String desc) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 40),
    child: Column(
      children: [
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(20)),
          child: Icon(icon, size: 32, color: const Color(0xFFCBD5E1)),
        ),
        const SizedBox(height: 12),
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
        const SizedBox(height: 4),
        Text(desc, style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
      ],
    ),
  );
}

// ───────────────────────── PAGES ─────────────────────────

// 1. Courses Page (Moved to student_courses_screen.dart)
// 2. My Project Page (Moved to student_my_project_screen.dart)

// 3. Contribution Page (Moved to student_contribution_screen.dart)

// 4. Alerts Page (Moved to student_alerts_screen.dart)

// 5. SRS Page (Moved to student_srs_screen.dart)
