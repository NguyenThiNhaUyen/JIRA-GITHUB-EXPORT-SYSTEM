import 'package:flutter/material.dart';

const Color kTeal = Color(0xFF0F766E);
const Color kTextPrimary = Color(0xFF111827);
const Color kTextSecondary = Color(0xFF6B7280);
const Color kCardBorder = Color(0xFFE5E7EB);
const Color kBg = Color(0xFFF9FAFB);

// ── HeaderInfoChip ─────────────────────────────────────────
class HeaderInfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const HeaderInfoChip({super.key, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: kCardBorder),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4)],
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 12, color: kTextSecondary),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 11, color: kTextSecondary, fontWeight: FontWeight.w500)),
      ]),
    );
  }
}

// ── MiniStat ───────────────────────────────────────────────
class MiniStat extends StatelessWidget {
  final String label;
  final String value;
  final Color bgColor;
  final Color textColor;
  const MiniStat({super.key, required this.label, required this.value, required this.bgColor, required this.textColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(14)),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Flexible(child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: textColor.withOpacity(0.8)))),
        Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
      ]),
    );
  }
}

// ── RuleLine ───────────────────────────────────────────────
class RuleLine extends StatelessWidget {
  final bool ok;
  final String text;
  const RuleLine({super.key, required this.ok, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Icon(ok ? Icons.check_circle_rounded : Icons.error_outline_rounded,
          size: 14, color: ok ? const Color(0xFF16A34A) : const Color(0xFFF59E0B)),
      const SizedBox(width: 6),
      Flexible(child: Text(text, style: const TextStyle(fontSize: 11, color: kTextPrimary))),
    ]);
  }
}

// ── SmartInfoCard ──────────────────────────────────────────
class SmartInfoCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const SmartInfoCard({super.key, required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(color: kBg, border: Border.all(color: kCardBorder), borderRadius: BorderRadius.circular(14)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Icon(icon, size: 13, color: kTextSecondary), const SizedBox(width: 5), Text(label, style: const TextStyle(fontSize: 10, color: kTextSecondary))]),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: kTextPrimary)),
      ]),
    );
  }
}

// ── StatusBadge ────────────────────────────────────────────
class StatusBadge extends StatelessWidget {
  final String? status;
  final IconData icon;
  final String label;
  const StatusBadge({super.key, required this.status, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final approved = status == 'APPROVED';
    final color = approved ? const Color(0xFF16A34A) : kTextSecondary;
    final bg = approved ? const Color(0xFFF0FDF4) : const Color(0xFFF3F4F6);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 9, color: color),
        const SizedBox(width: 3),
        Text('$label${approved ? ' ✓' : ''}', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: color, letterSpacing: 0.5)),
      ]),
    );
  }
}

// ── RiskBadge ──────────────────────────────────────────────
class RiskBadge extends StatelessWidget {
  final String state;
  const RiskBadge({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final map = {
      'healthy': [const Color(0xFFF0FDF4), const Color(0xFF16A34A), 'Ổn định'],
      'watch':   [const Color(0xFFFEFCE8), const Color(0xFFCA8A04), 'Theo dõi'],
      'warning': [const Color(0xFFFFF7ED), const Color(0xFFEA580C), 'Rủi ro'],
      'critical':[const Color(0xFFFEF2F2), const Color(0xFFDC2626), 'Nguy cấp'],
    };
    final info = map[state] ?? [const Color(0xFFF3F4F6), kTextSecondary, 'Không xác định'];
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: info[0] as Color, borderRadius: BorderRadius.circular(6)),
      child: Text(info[2] as String, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: info[1] as Color, letterSpacing: 0.5)),
    );
  }
}

// ── MetricChip ─────────────────────────────────────────────
class MetricChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const MetricChip({super.key, required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(color: kBg, border: Border.all(color: kCardBorder), borderRadius: BorderRadius.circular(20)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 10, color: kTextSecondary),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: kTextSecondary)),
      ]),
    );
  }
}

// ── GroupsSearchBar ────────────────────────────────────────
class GroupsSearchBar extends StatelessWidget {
  final String hint;
  final ValueChanged<String> onChanged;
  const GroupsSearchBar({super.key, required this.hint, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: onChanged,
      style: const TextStyle(fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: kTextSecondary, fontSize: 13),
        prefixIcon: const Icon(Icons.search_rounded, size: 16, color: kTextSecondary),
        filled: true,
        fillColor: kBg,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kCardBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kTeal, width: 1.5)),
      ),
    );
  }
}
