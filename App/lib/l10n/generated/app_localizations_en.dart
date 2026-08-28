// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'TradeMaster';

  @override
  String get explore => 'Explore';

  @override
  String get search => 'Search';

  @override
  String get profile => 'Profile';

  @override
  String get all => 'All';

  @override
  String get refresh => 'Refresh';

  @override
  String get retry => 'Retry';

  @override
  String get cancel => 'Cancel';

  @override
  String get save => 'Save';

  @override
  String get connect => 'Connect';

  @override
  String get guest => 'Guest';

  @override
  String get anonymous => 'Anonymous';

  @override
  String get searchBusinessesHint => 'Search businesses...';

  @override
  String get businessesNearYou => 'Businesses Near You';

  @override
  String get noBusinessesFound => 'No businesses found';

  @override
  String get noBusinessesFoundSubtitle =>
      'Try selecting a different category or pull down to refresh.';

  @override
  String get failedToLoadBusinesses => 'Failed to load businesses';

  @override
  String get recentSearches => 'Recent Searches';

  @override
  String get trendingCategories => 'Trending Categories';

  @override
  String get noResultsFound => 'No results found';

  @override
  String get noResultsFoundSubtitle =>
      'Try a different search term or category.';

  @override
  String get clearSearch => 'Clear Search';

  @override
  String businessesCount(int count) {
    return 'Businesses ($count)';
  }

  @override
  String get searchFailed => 'Search failed';

  @override
  String get call => 'Call';

  @override
  String get directions => 'Directions';

  @override
  String get address => 'Address';

  @override
  String get phone => 'Phone';

  @override
  String get email => 'Email';

  @override
  String get reviews => 'Reviews';

  @override
  String get noReviewsYet => 'No reviews yet';

  @override
  String get noReviewsYetSubtitle => 'Be the first to share your experience.';

  @override
  String get failedToLoadBusiness => 'Failed to load business';

  @override
  String get account => 'Account';

  @override
  String get editProfile => 'Edit Profile';

  @override
  String get editProfileSubtitle => 'Update your info';

  @override
  String get settings => 'Settings';

  @override
  String get settingsSubtitle => 'Server & theme';

  @override
  String get help => 'Help';

  @override
  String get helpSubtitle => 'Support center';

  @override
  String get demoData => 'Demo Data';

  @override
  String get demoDataSubtitle => 'Seed sample data';

  @override
  String get signOut => 'Sign Out';

  @override
  String get signOutConfirmation => 'Are you sure you want to sign out?';

  @override
  String get populateDemoData => 'Populate Demo Data';

  @override
  String get populateDemoDataConfirmation =>
      'This will add sample categories and businesses to your account. Continue?';

  @override
  String get populate => 'Populate';

  @override
  String get demoDataSuccess => 'Demo data populated successfully!';

  @override
  String get appearance => 'Appearance';

  @override
  String get appearanceSubtitle =>
      'Choose how TradeMaster looks on your device.';

  @override
  String get serverConnection => 'Server Connection';

  @override
  String get serverConnectionSubtitle =>
      'Change the address your app uses to reach the TradeMaster server.';

  @override
  String get serverUrl => 'Server URL';

  @override
  String get serverUrlHint => 'e.g. 192.168.1.100:3000';

  @override
  String get serverUrlRequired => 'Please enter a server URL';

  @override
  String get serverUrlSaved => 'Server URL saved';

  @override
  String get saveServerUrl => 'Save Server URL';

  @override
  String get serverUrlTip =>
      'Tip: Use your computer\'s local IP if testing on a physical device.';

  @override
  String get useDefaultLocalhost => 'Use Default (localhost)';

  @override
  String get welcomeBack => 'Welcome Back';

  @override
  String get signInSubtitle => 'Sign in to discover local businesses';

  @override
  String get emailLabel => 'Email';

  @override
  String get emailHint => 'your@email.com';

  @override
  String get passwordLabel => 'Password';

  @override
  String get signIn => 'Sign In';

  @override
  String get dontHaveAccount => 'Don\'t have an account? ';

  @override
  String get signUp => 'Sign Up';

  @override
  String get createAccount => 'Create Account';

  @override
  String get signUpSubtitle => 'Join the local business directory';

  @override
  String get firstName => 'First Name';

  @override
  String get lastName => 'Last Name';

  @override
  String get confirmPassword => 'Confirm Password';

  @override
  String get confirmPasswordRequired => 'Please confirm your password';

  @override
  String get passwordsDoNotMatch => 'Passwords do not match';

  @override
  String get alreadyHaveAccount => 'Already have an account? ';

  @override
  String get consentRequired =>
      'You must agree to the Privacy Policy and Terms of Service';

  @override
  String get privacyPolicy => 'Privacy Policy';

  @override
  String get termsOfService => 'Terms of Service';

  @override
  String get consentLabel =>
      'I have read and agree to the [PrivacyPolicy] and [TermsOfService]';

  @override
  String get welcomeToTradeMaster => 'Welcome to TradeMaster';

  @override
  String get serverUrlSetupSubtitle =>
      'Enter your server address to get started. You can change this later in Settings.';

  @override
  String get system => 'System';

  @override
  String get light => 'Light';

  @override
  String get dark => 'Dark';

  @override
  String get language => 'Language';

  @override
  String get english => 'English';

  @override
  String get persian => 'Persian';

  @override
  String get emailRequired => 'Email is required';

  @override
  String get invalidEmail => 'Please enter a valid email';

  @override
  String get passwordRequired => 'Password is required';

  @override
  String get passwordMinLength => 'Password must be at least 8 characters';

  @override
  String get passwordStrength =>
      'Password must contain uppercase, lowercase, and numeric characters';

  @override
  String fieldIsRequired(String fieldName) {
    return '$fieldName is required';
  }

  @override
  String get connectionTimedOut =>
      'Connection timed out. Please check your internet connection.';

  @override
  String get unableToConnect =>
      'Unable to connect to server. Please check your connection.';

  @override
  String get invalidEmailOrPassword => 'Invalid email or password.';

  @override
  String get emailAlreadyExists => 'An account with this email already exists.';

  @override
  String get serverError => 'Server error. Please try again later.';

  @override
  String requestFailedStatus(int statusCode) {
    return 'Request failed (status $statusCode).';
  }

  @override
  String get unexpectedError =>
      'An unexpected error occurred. Please try again.';

  @override
  String get locationServicesDisabled => 'Location services are disabled';

  @override
  String get locationPermissionDenied => 'Location permission denied';

  @override
  String get locationPermanentlyDenied =>
      'Location permissions are permanently denied';

  @override
  String get failedToSeedDemoData => 'Failed to seed demo data';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get deleteAccountSubtitle =>
      'Permanently delete your account and all associated data.';

  @override
  String get deleteAccountConfirmation =>
      'Are you sure you want to delete your account? This action cannot be undone.';

  @override
  String get deleteAccountFailed => 'Failed to delete account';

  @override
  String get comingSoon => 'Coming soon';
}
