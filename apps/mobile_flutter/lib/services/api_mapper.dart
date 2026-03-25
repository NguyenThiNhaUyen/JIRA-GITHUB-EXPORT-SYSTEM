import 'dart:convert';

class ApiMapper {
  static dynamic decodeBody(String body) {
    return jsonDecode(body);
  }

  static dynamic extractData(dynamic decoded) {
    if (decoded is Map<String, dynamic>) {
      return decoded['data'] ?? decoded['Data'] ?? decoded;
    }
    return decoded;
  }

  static List<Map<String, dynamic>> extractItems(dynamic data) {
    if (data is List) return data.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
    if (data is Map<String, dynamic>) {
      final items = data['items'] ?? data['Items'] ?? data['results'] ?? data['Results'];
      if (items is List) {
        return items.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
      }
    }
    return [];
  }

  static String pickString(Map<String, dynamic> src, List<String> keys, [String fallback = '']) {
    for (final k in keys) {
      final v = src[k];
      if (v != null) return v.toString();
    }
    return fallback;
  }

  static int pickInt(Map<String, dynamic> src, List<String> keys, [int fallback = 0]) {
    for (final k in keys) {
      final v = src[k];
      if (v is int) return v;
      if (v is num) return v.toInt();
      if (v != null) {
        final parsed = int.tryParse(v.toString());
        if (parsed != null) return parsed;
      }
    }
    return fallback;
  }
}

