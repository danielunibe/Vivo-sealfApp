import 'package:intl/intl.dart';

String formatCurrency(num value) => NumberFormat.currency(locale: 'es_MX', symbol: '\$').format(value);
