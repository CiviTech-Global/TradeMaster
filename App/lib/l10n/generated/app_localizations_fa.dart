// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Persian (`fa`).
class AppLocalizationsFa extends AppLocalizations {
  AppLocalizationsFa([String locale = 'fa']) : super(locale);

  @override
  String get appTitle => 'TradeMaster';

  @override
  String get explore => 'کاوش';

  @override
  String get search => 'جستجو';

  @override
  String get profile => 'پروفایل';

  @override
  String get all => 'همه';

  @override
  String get refresh => 'بروزرسانی';

  @override
  String get retry => 'تلاش مجدد';

  @override
  String get cancel => 'لغو';

  @override
  String get save => 'ذخیره';

  @override
  String get connect => 'اتصال';

  @override
  String get guest => 'مهمان';

  @override
  String get anonymous => 'ناشناس';

  @override
  String get searchBusinessesHint => 'جستجوی کسب‌وکارها...';

  @override
  String get businessesNearYou => 'کسب‌وکارهای نزدیک شما';

  @override
  String get noBusinessesFound => 'کسب‌وکاری یافت نشد';

  @override
  String get noBusinessesFoundSubtitle =>
      'دسته‌بندی دیگری انتخاب کنید یا برای بروزرسانی به پایین بکشید.';

  @override
  String get failedToLoadBusinesses => 'بارگذاری کسب‌وکارها ناموفق بود';

  @override
  String get recentSearches => 'جستجوهای اخیر';

  @override
  String get trendingCategories => 'دسته‌بندی‌های پرطرفدار';

  @override
  String get noResultsFound => 'نتیجه‌ای یافت نشد';

  @override
  String get noResultsFoundSubtitle => 'عبارت یا دسته‌بندی دیگری امتحان کنید.';

  @override
  String get clearSearch => 'پاک کردن جستجو';

  @override
  String businessesCount(int count) {
    return 'کسب‌وکارها ($count)';
  }

  @override
  String get searchFailed => 'جستجو ناموفق بود';

  @override
  String get call => 'تماس';

  @override
  String get directions => 'مسیریابی';

  @override
  String get address => 'آدرس';

  @override
  String get phone => 'تلفن';

  @override
  String get email => 'ایمیل';

  @override
  String get reviews => 'نظرات';

  @override
  String get noReviewsYet => 'هنوز نظری ثبت نشده';

  @override
  String get noReviewsYetSubtitle =>
      'اولین نفر باشید که تجربه خود را به اشتراک می‌گذارد.';

  @override
  String get failedToLoadBusiness => 'بارگذاری کسب‌وکار ناموفق بود';

  @override
  String get account => 'حساب کاربری';

  @override
  String get editProfile => 'ویرایش پروفایل';

  @override
  String get editProfileSubtitle => 'اطلاعات خود را به‌روز کنید';

  @override
  String get settings => 'تنظیمات';

  @override
  String get settingsSubtitle => 'سرور و تم';

  @override
  String get help => 'راهنما';

  @override
  String get helpSubtitle => 'مرکز پشتیبانی';

  @override
  String get demoData => 'داده نمونه';

  @override
  String get demoDataSubtitle => 'افزودن داده‌های نمونه';

  @override
  String get signOut => 'خروج از حساب';

  @override
  String get signOutConfirmation => 'آیا مطمئن هستید که می‌خواهید خارج شوید؟';

  @override
  String get populateDemoData => 'افزودن داده نمونه';

  @override
  String get populateDemoDataConfirmation =>
      'این کار دسته‌بندی‌ها و کسب‌وکارهای نمونه را به حساب شما اضافه می‌کند. ادامه می‌دهید؟';

  @override
  String get populate => 'افزودن';

  @override
  String get demoDataSuccess => 'داده‌های نمونه با موفقیت اضافه شدند!';

  @override
  String get appearance => 'ظاهر';

  @override
  String get appearanceSubtitle =>
      'انتخاب کنید TradeMaster در دستگاه شما چگونه نمایش داده شود.';

  @override
  String get serverConnection => 'اتصال به سرور';

  @override
  String get serverConnectionSubtitle =>
      'آدرسی که برنامه برای دسترسی به سرور TradeMaster استفاده می‌کند را تغییر دهید.';

  @override
  String get serverUrl => 'آدرس سرور';

  @override
  String get serverUrlHint => 'مثال: 192.168.1.100:3000';

  @override
  String get serverUrlRequired => 'لطفاً آدرس سرور را وارد کنید';

  @override
  String get serverUrlSaved => 'آدرس سرور ذخیره شد';

  @override
  String get saveServerUrl => 'ذخیره آدرس سرور';

  @override
  String get serverUrlTip =>
      'راهنما: اگر روی دستگاه واقعی تست می‌کنید، از IP محلی کامپیوتر خود استفاده کنید.';

  @override
  String get useDefaultLocalhost => 'استفاده از پیش‌فرض (localhost)';

  @override
  String get welcomeBack => 'خوش آمدید';

  @override
  String get signInSubtitle => 'برای کشف کسب‌وکارهای محلی وارد شوید';

  @override
  String get emailLabel => 'ایمیل';

  @override
  String get emailHint => 'your@email.com';

  @override
  String get passwordLabel => 'رمز عبور';

  @override
  String get signIn => 'ورود';

  @override
  String get dontHaveAccount => 'حساب کاربری ندارید؟ ';

  @override
  String get signUp => 'ثبت‌نام';

  @override
  String get createAccount => 'ایجاد حساب کاربری';

  @override
  String get signUpSubtitle => 'به دایرکتوری کسب‌وکارهای محلی بپیوندید';

  @override
  String get firstName => 'نام';

  @override
  String get lastName => 'نام خانوادگی';

  @override
  String get confirmPassword => 'تکرار رمز عبور';

  @override
  String get confirmPasswordRequired => 'لطفاً رمز عبور خود را تأیید کنید';

  @override
  String get passwordsDoNotMatch => 'رمزهای عبور مطابقت ندارند';

  @override
  String get alreadyHaveAccount => 'قبلاً حساب کاربری دارید؟ ';

  @override
  String get consentRequired =>
      'باید با سیاست حریم خصوصی و شرایط استفاده موافقت کنید';

  @override
  String get privacyPolicy => 'سیاست حریم خصوصی';

  @override
  String get termsOfService => 'شرایط استفاده';

  @override
  String get consentLabel =>
      'من [PrivacyPolicy] و [TermsOfService] را خوانده‌ام و می‌پذیرم';

  @override
  String get welcomeToTradeMaster => 'به TradeMaster خوش آمدید';

  @override
  String get serverUrlSetupSubtitle =>
      'آدرس سرور خود را برای شروع وارد کنید. بعداً می‌توانید آن را در تنظیمات تغییر دهید.';

  @override
  String get system => 'سیستم';

  @override
  String get light => 'روشن';

  @override
  String get dark => 'تاریک';

  @override
  String get language => 'زبان';

  @override
  String get english => 'English';

  @override
  String get persian => 'فارسی';

  @override
  String get emailRequired => 'ایمیل الزامی است';

  @override
  String get invalidEmail => 'لطفاً یک ایمیل معتبر وارد کنید';

  @override
  String get passwordRequired => 'رمز عبور الزامی است';

  @override
  String get passwordMinLength => 'رمز عبور باید حداقل ۸ کاراکتر باشد';

  @override
  String get passwordStrength =>
      'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد';

  @override
  String fieldIsRequired(String fieldName) {
    return '$fieldName الزامی است';
  }

  @override
  String get connectionTimedOut =>
      'زمان اتصال به پایان رسید. لطفاً اتصال اینترنت خود را بررسی کنید.';

  @override
  String get unableToConnect =>
      'امکان اتصال به سرور وجود ندارد. لطفاً اتصال خود را بررسی کنید.';

  @override
  String get invalidEmailOrPassword => 'ایمیل یا رمز عبور نامعتبر است.';

  @override
  String get emailAlreadyExists =>
      'حساب کاربری با این ایمیل قبلاً ثبت شده است.';

  @override
  String get serverError => 'خطای سرور. لطفاً بعداً دوباره تلاش کنید.';

  @override
  String requestFailedStatus(int statusCode) {
    return 'درخواست ناموفق بود (کد وضعیت $statusCode).';
  }

  @override
  String get unexpectedError =>
      'خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.';

  @override
  String get locationServicesDisabled => 'خدمات مکان‌یابی غیرفعال است';

  @override
  String get locationPermissionDenied =>
      'اجازه دسترسی به موقعیت مکانی داده نشد';

  @override
  String get locationPermanentlyDenied =>
      'اجازه دسترسی به موقعیت مکانی به صورت دائمی رد شده است';

  @override
  String get failedToSeedDemoData => 'افزودن داده نمونه ناموفق بود';

  @override
  String get deleteAccount => 'حذف حساب کاربری';

  @override
  String get deleteAccountSubtitle =>
      'حساب کاربری و تمام داده‌های مرتبط را برای همیشه حذف کنید.';

  @override
  String get deleteAccountConfirmation =>
      'آیا مطمئن هستید که می‌خواهید حساب کاربری خود را حذف کنید؟ این عمل قابل بازگشت نیست.';

  @override
  String get deleteAccountFailed => 'حذف حساب کاربری ناموفق بود';

  @override
  String get comingSoon => 'به زودی';
}
