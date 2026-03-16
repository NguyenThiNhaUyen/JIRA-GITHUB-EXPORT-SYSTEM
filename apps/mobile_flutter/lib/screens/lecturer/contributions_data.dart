import 'dart:math';

class AppStudent {
  final String studentId;
  final String name;
  final String studentCode;
  final String email;
  final String groupId;
  final String groupName;
  final int commits;
  final int jiraDone;
  final int prs;
  final int reviews;
  final int activeDays;
  final int overdueTasks;
  final int lastActiveDaysAgo;
  final int score;
  final String status;
  final List<int> dailyActivity;

  AppStudent({
    required this.studentId, required this.name, required this.studentCode, required this.email,
    required this.groupId, required this.groupName, required this.commits, required this.jiraDone,
    required this.prs, required this.reviews, required this.activeDays, required this.overdueTasks,
    required this.lastActiveDaysAgo, required this.score, required this.status, required this.dailyActivity,
  });
}

class AppGroup {
  final String id;
  final String name;
  final List<AppStudent> members;
  final int memberCount;
  final int totalCommits;
  final int totalJira;
  final int totalScore;
  final int zeroCommitMembers;
  final int balancePercent;
  final GroupRisk risk;

  AppGroup({
    required this.id, required this.name, required this.members, required this.memberCount,
    required this.totalCommits, required this.totalJira, required this.totalScore,
    required this.zeroCommitMembers, required this.balancePercent, required this.risk,
  });
}

class GroupRisk {
  final String label;
  final int level; // 1: Ổn định, 2: Cần theo dõi, 3: Rủi ro cao
  GroupRisk({required this.label, required this.level});
}

class ContributionsData {
  static const List<Map<String, dynamic>> C_MOCK_COURSES = [
    {
      "id": "mock-course-1",
      "code": "SWD392-SE1801",
      "name": "SWD392 - Software Architecture",
      "groups": [
        {
          "id": "g1", "name": "Team Alpha",
          "team": [
            {"studentId": "s1", "studentCode": "SE180001", "studentName": "Nguyễn Minh Anh", "email": "minhanh@fpt.edu.vn"},
            {"studentId": "s2", "studentCode": "SE180002", "studentName": "Trần Quang Huy", "email": "quanghuy@fpt.edu.vn"},
            {"studentId": "s3", "studentCode": "SE180003", "studentName": "Lê Thu Trang", "email": "thutrang@fpt.edu.vn"},
            {"studentId": "s4", "studentCode": "SE180004", "studentName": "Phạm Gia Bảo", "email": "giabao@fpt.edu.vn"},
          ]
        },
        {
          "id": "g2", "name": "Team Beta",
          "team": [
            {"studentId": "s5", "studentCode": "SE180005", "studentName": "Võ Khánh Linh", "email": "khanhlinh@fpt.edu.vn"},
            {"studentId": "s6", "studentCode": "SE180006", "studentName": "Đỗ Thành Công", "email": "thanhcong@fpt.edu.vn"},
            {"studentId": "s7", "studentCode": "SE180007", "studentName": "Ngô Hải Yến", "email": "haiyen@fpt.edu.vn"},
            {"studentId": "s8", "studentCode": "SE180008", "studentName": "Bùi Nhật Nam", "email": "nhatnam@fpt.edu.vn"},
          ]
        }
      ]
    }
  ];

  static List<AppStudent> generateMockStudents(List<dynamic> groups) {
    Random r = Random(42);
    List<AppStudent> res = [];
    for (var g in groups) {
      for (var m in g['team']) {
        int commits = r.nextInt(30);
        int jira = r.nextInt(20);
        int prs = r.nextInt(10);
        int reviews = r.nextInt(10);
        int activeD = r.nextInt(15);
        int overdue = r.nextInt(3);
        int lastAct = commits == 0 ? 10 + r.nextInt(10) : r.nextInt(7);
        double s = commits*2.2 + jira*2 + prs*3 + reviews*1.4 + activeD*2 - overdue*3;
        int score = max(0, min(100, s.round()));
        
        String st = "Ổn định";
        if (commits == 0) st = "Chưa commit";
        else if (score >= 82) st = "Rất tốt";
        else if (score >= 62) st = "Tích cực";
        else if (score >= 40) st = "Ổn định";
        else st = "Cần chú ý";

        List<int> heat = List.generate(84, (_) => commits == 0 ? 0 : (r.nextDouble() > 0.8 ? r.nextInt(5)+1 : 0));
        res.add(AppStudent(
          studentId: m['studentId'], name: m['studentName'], studentCode: m['studentCode'], email: m['email'],
          groupId: g['id'], groupName: g['name'], commits: commits, jiraDone: jira, prs: prs, reviews: reviews,
          activeDays: activeD, overdueTasks: overdue, lastActiveDaysAgo: lastAct, score: score, status: st, dailyActivity: heat
        ));
      }
    }
    return res;
  }

  static List<AppGroup> generateGroups(List<dynamic> rawGroups, List<AppStudent> allStudents) {
    List<AppGroup> res = [];
    for (var g in rawGroups) {
      var members = allStudents.where((s) => s.groupId == g['id']).toList();
      int tCommits = members.fold(0, (sum, s) => sum + s.commits);
      int tJira = members.fold(0, (sum, s) => sum + s.jiraDone);
      int tScore = members.fold(0, (sum, s) => sum + s.score);
      int maxC = members.fold(0, (m, s) => max(m, s.commits));
      int zeroC = members.where((s) => s.commits == 0).length;
      double avg = members.isNotEmpty ? tCommits / members.length : 0;
      int balance = maxC == 0 ? 0 : max(0, min(100, ((avg/maxC)*100).round()));
      
      GroupRisk risk = GroupRisk(label: 'Ổn định', level: 1);
      if (zeroC >= 2 || balance < 35 || tCommits < 8) risk = GroupRisk(label: 'Rủi ro cao', level: 3);
      else if (zeroC >= 1 || balance < 55 || tCommits < 15) risk = GroupRisk(label: 'Cần theo dõi', level: 2);

      res.add(AppGroup(
        id: g['id'], name: g['name'], members: members, memberCount: members.length,
        totalCommits: tCommits, totalJira: tJira, totalScore: tScore, zeroCommitMembers: zeroC,
        balancePercent: balance, risk: risk
      ));
    }
    return res;
  }
}
