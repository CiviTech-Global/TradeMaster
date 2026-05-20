/// Safely parse a JSON value that may be [num] or [String] to [double].
/// Returns [fallback] when [value] is null.
double parseJsonDouble(dynamic value, [double fallback = 0]) {
  if (value == null) return fallback;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? fallback;
  return fallback;
}

/// Safely parse a nullable JSON value to [double?].
double? parseJsonDoubleOrNull(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value);
  return null;
}
