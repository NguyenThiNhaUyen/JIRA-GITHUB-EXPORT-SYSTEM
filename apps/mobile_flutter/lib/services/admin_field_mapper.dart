class AdminFieldMapper {
  static dynamic pick(Map<String, dynamic> src, List<String> keys, [dynamic fallback]) {
    for (final key in keys) {
      if (src.containsKey(key) && src[key] != null) return src[key];
    }
    return fallback;
  }

  static String pickString(Map<String, dynamic> src, List<String> keys, [String fallback = '']) {
    final value = pick(src, keys, fallback);
    return value?.toString() ?? fallback;
  }

  static int pickInt(Map<String, dynamic> src, List<String> keys, [int fallback = 0]) {
    final value = pick(src, keys, fallback);
    if (value is int) return value;
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  static bool pickBool(Map<String, dynamic> src, List<String> keys, [bool fallback = false]) {
    final value = pick(src, keys, fallback);
    if (value is bool) return value;
    final raw = value?.toString().toLowerCase();
    if (raw == 'true' || raw == '1') return true;
    if (raw == 'false' || raw == '0') return false;
    return fallback;
  }
}

