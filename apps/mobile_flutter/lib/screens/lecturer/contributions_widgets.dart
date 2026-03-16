import 'package:flutter/material.dart';
import 'contributions_data.dart';

// ── Shared Colors ─────────────────────────────────────
const Color kCard    = Colors.white;
const Color kBdr     = Color(0xFFF0F0F0);
const Color kTextPx  = Color(0xFF1A202C);
const Color kTextSx  = Color(0xFF64748B);
const Color kTeal    = Color(0xFF0F766E);
const Color kTealL   = Color(0xFF14B8A6);

// ── Line Chart Painter ────────────────────────────
class ContributionsLineChartPainter extends CustomPainter {
  final List<int> gh;
  final List<int> jira;
  final double maxVal;

  ContributionsLineChartPainter(this.gh, this.jira, this.maxVal);

  @override
  void paint(Canvas canvas, Size size) {
    if (gh.isEmpty || maxVal == 0) return;
    void drawLine(List<int> data, Color color) {
      final paint = Paint()..color = color..strokeWidth = 2.4..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
      final dotPaint = Paint()..color = color..style = PaintingStyle.fill;
      final path = Path();
      for (int i = 0; i < data.length; i++) {
        final x = i == 0 ? 0.0 : (i / (data.length - 1)) * size.width;
        final y = size.height - (data[i] / maxVal) * size.height;
        if (i == 0) path.moveTo(x, y); else path.lineTo(x, y);
        canvas.drawCircle(Offset(x, y), 2, dotPaint);
      }
      canvas.drawPath(path, paint);
    }

    final grid = Paint()..color = const Color(0xFFE2E8F0)..strokeWidth = 0.7;
    for (int i = 1; i <= 4; i++) {
      final y = size.height * i / 5;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), grid);
    }
    drawLine(gh, const Color(0xFF14B8A6));
    drawLine(jira, const Color(0xFF3B82F6));
  }

  @override
  bool shouldRepaint(covariant CustomPainter old) => false;
}

// ── Action Modal ──────────────────────────────────
class ActionModal extends StatefulWidget {
  final bool open;
  final String actionType;
  final AppStudent? student;
  final VoidCallback onClose;
  final Function(String) onConfirm;

  const ActionModal({super.key, required this.open, required this.actionType, required this.student, required this.onClose, required this.onConfirm});

  @override
  State<ActionModal> createState() => _ActionModalState();
}

class _ActionModalState extends State<ActionModal> {
  late TextEditingController _msgCtrl;

  @override
  void initState() {
    super.initState();
    _msgCtrl = TextEditingController();
  }
  
  @override
  void didUpdateWidget(ActionModal old) {
    super.didUpdateWidget(old);
    if (widget.open && !old.open && widget.student != null) {
      _msgCtrl.text = widget.actionType == 'email'
        ? 'Chào ${widget.student!.name}, mức độ đóng góp hiện tại của bạn đang thấp hơn kỳ vọng. Vui lòng kiểm tra lại tiến độ.'
        : 'Bạn cần cải thiện mức độ đóng góp. Vui lòng cập nhật tiến độ sớm.';
    }
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.open || widget.student == null) return const SizedBox.shrink();
    final bool isEmail = widget.actionType == 'email';

    return Stack(children: [
      GestureDetector(onTap: widget.onClose, child: Container(color: Colors.black45)),
      Center(child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Material(
          color: Colors.transparent,
          child: Container(
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Padding(
                padding: const EdgeInsets.all(20),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(isEmail ? 'Gửi email cảnh báo' : 'Gửi cảnh báo', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: kTextPx)),
                    Text('${widget.student!.name} • ${widget.student!.studentCode} • ${widget.student!.groupName}', style: const TextStyle(fontSize: 12, color: kTextSx)),
                  ])),
                  IconButton(icon: const Icon(Icons.close, size: 20), onPressed: widget.onClose)
                ])
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  _stat('Commit', '${widget.student!.commits}'),
                  _stat('Jira', '${widget.student!.jiraDone}'),
                  _stat('Score', '${widget.student!.score}'),
                  Expanded(child: _stat('Email', widget.student!.email, true)),
                ]),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: TextField(
                  controller: _msgCtrl, maxLines: 5,
                  style: const TextStyle(fontSize: 13, color: kTextPx),
                  decoration: InputDecoration(
                    fillColor: const Color(0xFFF8FAFC), filled: true,
                    hintText: 'Nội dung ${isEmail ? "email" : "cảnh báo"}',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBdr)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kBdr)),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
                  TextButton(onPressed: widget.onClose, child: const Text('Hủy', style: TextStyle(color: kTextSx))),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    onPressed: () => widget.onConfirm(_msgCtrl.text),
                    icon: Icon(isEmail ? Icons.mail : Icons.send, size: 16),
                    label: Text(isEmail ? 'Gửi email' : 'Gửi cảnh báo'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kTeal, foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                    ),
                  )
                ])
              )
            ]),
          )
        )
      ))
    ]);
  }

  Widget _stat(String lbl, String val, [bool wrap = false]) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12), border: Border.all(color: kBdr)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(lbl, style: const TextStyle(fontSize: 10, color: kTextSx)),
        Text(val, style: TextStyle(fontSize: wrap ? 11 : 16, fontWeight: FontWeight.bold, color: kTextPx), overflow: wrap ? TextOverflow.ellipsis : null),
      ]),
    );
  }
}
