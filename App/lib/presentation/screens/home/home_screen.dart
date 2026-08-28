import 'package:flutter/material.dart';
import 'package:trademaster/l10n/generated/app_localizations.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.explore),
      ),
      body: Center(
        child: Text(l10n.comingSoon),
      ),
    );
  }
}
