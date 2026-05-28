import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_am.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
      : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
    delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
  ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('am'),
    Locale('en')
  ];

  /// Application name
  ///
  /// In en, this message translates to:
  /// **'Theraphy'**
  String get appName;

  /// App tagline
  ///
  /// In en, this message translates to:
  /// **'Treating Anxiety & Phobias'**
  String get appTagline;

  /// Language label
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// English language name
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get english;

  /// Amharic language name
  ///
  /// In en, this message translates to:
  /// **'አማርኛ'**
  String get amharic;

  /// Language selection screen title
  ///
  /// In en, this message translates to:
  /// **'Select Language'**
  String get selectLanguage;

  /// Snackbar when language changes
  ///
  /// In en, this message translates to:
  /// **'Language updated'**
  String get languageChanged;

  /// Login button label
  ///
  /// In en, this message translates to:
  /// **'Log In'**
  String get login;

  /// Sign up button label
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get signUp;

  /// Sign out button label
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get signOut;

  /// Sign out confirmation dialog title
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get signOutConfirmTitle;

  /// Sign out confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to sign out?'**
  String get signOutConfirmMessage;

  /// Create account button label
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// Login screen headline
  ///
  /// In en, this message translates to:
  /// **'Welcome Back'**
  String get welcomeBack;

  /// Login screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Sign in to continue your wellness journey.'**
  String get signInToContinue;

  /// Register screen headline
  ///
  /// In en, this message translates to:
  /// **'Join Us'**
  String get joinUs;

  /// Register screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Start your path to tranquility today.'**
  String get startYourPath;

  /// Welcome screen headline
  ///
  /// In en, this message translates to:
  /// **'Take a Deep Breath'**
  String get takeADeepBreath;

  /// Welcome screen subtitle
  ///
  /// In en, this message translates to:
  /// **'Your journey to a calmer, fear-free life starts here. We\'re with you every step of the way.'**
  String get welcomeSubtitle;

  /// Email field hint
  ///
  /// In en, this message translates to:
  /// **'Email Address'**
  String get emailAddress;

  /// Password field hint
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// Full name field hint
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get fullName;

  /// Forgot password link
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// Already have account text
  ///
  /// In en, this message translates to:
  /// **'Already have an account? '**
  String get alreadyHaveAccount;

  /// Don't have account text
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? '**
  String get dontHaveAccount;

  /// Terms notice on register screen
  ///
  /// In en, this message translates to:
  /// **'By signing up, you agree to our Terms of Service and Privacy Policy.'**
  String get termsNotice;

  /// Invalid email validation message
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email'**
  String get invalidEmail;

  /// Password too short validation message
  ///
  /// In en, this message translates to:
  /// **'Password too short'**
  String get passwordTooShort;

  /// Password minimum length message
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 6 characters'**
  String get passwordMinLength;

  /// Name required validation message
  ///
  /// In en, this message translates to:
  /// **'Enter your name'**
  String get enterYourName;

  /// Required field validation message
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get required;

  /// Network error message
  ///
  /// In en, this message translates to:
  /// **'Network error. Please check your connection.'**
  String get networkError;

  /// Try again button label
  ///
  /// In en, this message translates to:
  /// **'Try Again'**
  String get tryAgain;

  /// Cancel button label
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// Save button label
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// Edit button label
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get edit;

  /// Delete button label
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// Confirm button label
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// Close button label
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// Home nav label
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get home;

  /// Therapy nav label
  ///
  /// In en, this message translates to:
  /// **'Therapy'**
  String get therapy;

  /// Support nav label
  ///
  /// In en, this message translates to:
  /// **'Support'**
  String get support;

  /// Progress nav label
  ///
  /// In en, this message translates to:
  /// **'Progress'**
  String get progress;

  /// Profile nav label
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// Good morning greeting
  ///
  /// In en, this message translates to:
  /// **'Good morning'**
  String get goodMorning;

  /// Good afternoon greeting
  ///
  /// In en, this message translates to:
  /// **'Good afternoon'**
  String get goodAfternoon;

  /// Good evening greeting
  ///
  /// In en, this message translates to:
  /// **'Good evening'**
  String get goodEvening;

  /// Dashboard mood prompt
  ///
  /// In en, this message translates to:
  /// **'How are you feeling today?'**
  String get howAreYouFeeling;

  /// Next session section title
  ///
  /// In en, this message translates to:
  /// **'Next Session'**
  String get nextSession;

  /// Empty sessions message
  ///
  /// In en, this message translates to:
  /// **'No sessions scheduled'**
  String get noSessionsScheduled;

  /// Book session button label
  ///
  /// In en, this message translates to:
  /// **'Book Session'**
  String get bookSession;

  /// Empty session card subtitle
  ///
  /// In en, this message translates to:
  /// **'Schedule your next therapy session to stay on track.'**
  String get scheduleNextSession;

  /// Join session button
  ///
  /// In en, this message translates to:
  /// **'Join'**
  String get join;

  /// CBT exercises section title
  ///
  /// In en, this message translates to:
  /// **'CBT Exercises'**
  String get cbtExercises;

  /// Exposure therapy section title
  ///
  /// In en, this message translates to:
  /// **'Exposure Therapy'**
  String get exposureTherapy;

  /// See all link
  ///
  /// In en, this message translates to:
  /// **'See All'**
  String get seeAll;

  /// Breathing quick action label
  ///
  /// In en, this message translates to:
  /// **'Breathing'**
  String get breathing;

  /// CBT quick action label
  ///
  /// In en, this message translates to:
  /// **'CBT'**
  String get cbt;

  /// Exposure quick action label
  ///
  /// In en, this message translates to:
  /// **'Exposure'**
  String get exposure;

  /// Assessment quick action label
  ///
  /// In en, this message translates to:
  /// **'Assess'**
  String get assess;

  /// AI chat quick action label
  ///
  /// In en, this message translates to:
  /// **'AI Chat'**
  String get aiChat;

  /// Mood tracking screen title
  ///
  /// In en, this message translates to:
  /// **'Mood Tracking'**
  String get moodTracking;

  /// Mood log card title
  ///
  /// In en, this message translates to:
  /// **'How are you feeling?'**
  String get howAreYouFeelingNow;

  /// Mood slider label
  ///
  /// In en, this message translates to:
  /// **'Mood'**
  String get mood;

  /// Anxiety level slider label
  ///
  /// In en, this message translates to:
  /// **'Anxiety Level'**
  String get anxietyLevel;

  /// Emotions section label
  ///
  /// In en, this message translates to:
  /// **'Emotions'**
  String get emotions;

  /// Notes field label
  ///
  /// In en, this message translates to:
  /// **'Notes (optional)'**
  String get notesOptional;

  /// Notes field hint text
  ///
  /// In en, this message translates to:
  /// **'How was your day? Any triggers?'**
  String get notesHint;

  /// Log mood button label
  ///
  /// In en, this message translates to:
  /// **'Log Mood'**
  String get logMood;

  /// Mood logged success message
  ///
  /// In en, this message translates to:
  /// **'Mood logged successfully'**
  String get moodLoggedSuccess;

  /// Recent mood entries section title
  ///
  /// In en, this message translates to:
  /// **'Recent Entries'**
  String get recentEntries;

  /// Empty mood entries message
  ///
  /// In en, this message translates to:
  /// **'No mood entries yet'**
  String get noMoodEntries;

  /// Mood slider low label
  ///
  /// In en, this message translates to:
  /// **'Very Low'**
  String get veryLow;

  /// Mood slider high label
  ///
  /// In en, this message translates to:
  /// **'Excellent'**
  String get excellent;

  /// Anxiety slider low label
  ///
  /// In en, this message translates to:
  /// **'None'**
  String get none;

  /// Anxiety slider high label
  ///
  /// In en, this message translates to:
  /// **'Severe'**
  String get severe;

  /// No description provided for @emotionCalm.
  ///
  /// In en, this message translates to:
  /// **'Calm'**
  String get emotionCalm;

  /// No description provided for @emotionHappy.
  ///
  /// In en, this message translates to:
  /// **'Happy'**
  String get emotionHappy;

  /// No description provided for @emotionAnxious.
  ///
  /// In en, this message translates to:
  /// **'Anxious'**
  String get emotionAnxious;

  /// No description provided for @emotionSad.
  ///
  /// In en, this message translates to:
  /// **'Sad'**
  String get emotionSad;

  /// No description provided for @emotionAngry.
  ///
  /// In en, this message translates to:
  /// **'Angry'**
  String get emotionAngry;

  /// No description provided for @emotionHopeful.
  ///
  /// In en, this message translates to:
  /// **'Hopeful'**
  String get emotionHopeful;

  /// No description provided for @emotionTired.
  ///
  /// In en, this message translates to:
  /// **'Tired'**
  String get emotionTired;

  /// No description provided for @emotionStressed.
  ///
  /// In en, this message translates to:
  /// **'Stressed'**
  String get emotionStressed;

  /// No description provided for @emotionGrateful.
  ///
  /// In en, this message translates to:
  /// **'Grateful'**
  String get emotionGrateful;

  /// No description provided for @emotionOverwhelmed.
  ///
  /// In en, this message translates to:
  /// **'Overwhelmed'**
  String get emotionOverwhelmed;

  /// Sessions screen title
  ///
  /// In en, this message translates to:
  /// **'Sessions'**
  String get sessions;

  /// Upcoming sessions tab
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get upcoming;

  /// Past sessions tab
  ///
  /// In en, this message translates to:
  /// **'Past'**
  String get past;

  /// Empty upcoming sessions message
  ///
  /// In en, this message translates to:
  /// **'No upcoming sessions'**
  String get noUpcomingSessions;

  /// Empty past sessions message
  ///
  /// In en, this message translates to:
  /// **'No past sessions'**
  String get noPastSessions;

  /// Book session sheet title
  ///
  /// In en, this message translates to:
  /// **'Book a Session'**
  String get bookASession;

  /// Session type label
  ///
  /// In en, this message translates to:
  /// **'Session Type'**
  String get sessionType;

  /// Duration label
  ///
  /// In en, this message translates to:
  /// **'Duration'**
  String get duration;

  /// Confirm booking button
  ///
  /// In en, this message translates to:
  /// **'Confirm Booking'**
  String get confirmBooking;

  /// Session booked success message
  ///
  /// In en, this message translates to:
  /// **'Session booked successfully'**
  String get sessionBookedSuccess;

  /// Booking confirmed message
  ///
  /// In en, this message translates to:
  /// **'Booking Confirmed'**
  String get bookingConfirmed;

  /// Therapist label
  ///
  /// In en, this message translates to:
  /// **'Therapist'**
  String get therapist;

  /// Book appointment button
  ///
  /// In en, this message translates to:
  /// **'Book Appointment'**
  String get bookAppointment;

  /// Paid payment status
  ///
  /// In en, this message translates to:
  /// **'Paid'**
  String get paid;

  /// Pending payment status
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get pending;

  /// Pay now button
  ///
  /// In en, this message translates to:
  /// **'Pay Now'**
  String get payNow;

  /// Payment success message
  ///
  /// In en, this message translates to:
  /// **'Payment Successful'**
  String get paymentSuccessful;

  /// AI chat screen title
  ///
  /// In en, this message translates to:
  /// **'AI Support Chat'**
  String get aiSupportChat;

  /// AI assistant name in banner
  ///
  /// In en, this message translates to:
  /// **'AI Mental Health Assistant'**
  String get aiAssistantName;

  /// AI assistant subtitle
  ///
  /// In en, this message translates to:
  /// **'Available 24/7 · Confidential · Supportive'**
  String get aiAssistantSubtitle;

  /// AI chat input hint
  ///
  /// In en, this message translates to:
  /// **'Start a new conversation...'**
  String get startNewConversation;

  /// Empty AI chat state title
  ///
  /// In en, this message translates to:
  /// **'No conversations yet'**
  String get noConversationsYet;

  /// Empty AI chat state subtitle
  ///
  /// In en, this message translates to:
  /// **'Start a conversation with your AI mental health assistant. It\'s confidential and available anytime.'**
  String get noConversationsSubtitle;

  /// No description provided for @starterHelpAnxiety.
  ///
  /// In en, this message translates to:
  /// **'Help with anxiety'**
  String get starterHelpAnxiety;

  /// No description provided for @starterCantSleep.
  ///
  /// In en, this message translates to:
  /// **'I can\'t sleep'**
  String get starterCantSleep;

  /// No description provided for @starterFeelOverwhelmed.
  ///
  /// In en, this message translates to:
  /// **'Feeling overwhelmed'**
  String get starterFeelOverwhelmed;

  /// No description provided for @starterBreathing.
  ///
  /// In en, this message translates to:
  /// **'Quick breathing exercise'**
  String get starterBreathing;

  /// Emergency screen title
  ///
  /// In en, this message translates to:
  /// **'Emergency Support'**
  String get emergencySupport;

  /// Crisis banner title
  ///
  /// In en, this message translates to:
  /// **'Crisis Support'**
  String get crisisSupport;

  /// Crisis banner message
  ///
  /// In en, this message translates to:
  /// **'If you are in immediate danger, call emergency services (911) first. This feature alerts your therapist and support team.'**
  String get crisisBannerMessage;

  /// Severity level section title
  ///
  /// In en, this message translates to:
  /// **'Severity Level'**
  String get severityLevel;

  /// No description provided for @severityLow.
  ///
  /// In en, this message translates to:
  /// **'Low'**
  String get severityLow;

  /// No description provided for @severityMedium.
  ///
  /// In en, this message translates to:
  /// **'Medium'**
  String get severityMedium;

  /// No description provided for @severityHigh.
  ///
  /// In en, this message translates to:
  /// **'High'**
  String get severityHigh;

  /// Emergency alert button text
  ///
  /// In en, this message translates to:
  /// **'SEND EMERGENCY ALERT'**
  String get sendEmergencyAlert;

  /// Emergency confirm dialog title
  ///
  /// In en, this message translates to:
  /// **'Confirm Emergency Alert'**
  String get confirmEmergencyTitle;

  /// Emergency confirm dialog message
  ///
  /// In en, this message translates to:
  /// **'This will notify your therapist and support team immediately. Are you sure you want to send an emergency alert?'**
  String get confirmEmergencyMessage;

  /// Send alert button in dialog
  ///
  /// In en, this message translates to:
  /// **'Send Alert'**
  String get sendAlert;

  /// Emergency alert sent success message
  ///
  /// In en, this message translates to:
  /// **'Emergency alert sent. Help is on the way.'**
  String get emergencyAlertSent;

  /// Crisis resources section title
  ///
  /// In en, this message translates to:
  /// **'Crisis Resources'**
  String get crisisResources;

  /// No description provided for @nationalCrisisHotline.
  ///
  /// In en, this message translates to:
  /// **'National Crisis Hotline'**
  String get nationalCrisisHotline;

  /// No description provided for @nationalCrisisHotlineSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Call or text 988'**
  String get nationalCrisisHotlineSubtitle;

  /// No description provided for @crisisTextLine.
  ///
  /// In en, this message translates to:
  /// **'Crisis Text Line'**
  String get crisisTextLine;

  /// No description provided for @crisisTextLineSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Text HOME to 741741'**
  String get crisisTextLineSubtitle;

  /// No description provided for @emergencyServices.
  ///
  /// In en, this message translates to:
  /// **'Emergency Services'**
  String get emergencyServices;

  /// No description provided for @emergencyServicesSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Call 911'**
  String get emergencyServicesSubtitle;

  /// Profile screen title
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profileTitle;

  /// Client role badge
  ///
  /// In en, this message translates to:
  /// **'Client'**
  String get client;

  /// Age label
  ///
  /// In en, this message translates to:
  /// **'Age'**
  String get age;

  /// Phone label
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get phone;

  /// Gender label
  ///
  /// In en, this message translates to:
  /// **'Gender'**
  String get gender;

  /// Primary concern label
  ///
  /// In en, this message translates to:
  /// **'Primary Concern'**
  String get primaryConcern;

  /// Not set placeholder
  ///
  /// In en, this message translates to:
  /// **'Not set'**
  String get notSet;

  /// Age display
  ///
  /// In en, this message translates to:
  /// **'{age} years'**
  String yearsOld(int age);

  /// Anxiety level card title
  ///
  /// In en, this message translates to:
  /// **'Anxiety Level'**
  String get anxietyLevelLabel;

  /// Emergency contacts section title
  ///
  /// In en, this message translates to:
  /// **'Emergency Contacts'**
  String get emergencyContacts;

  /// Empty emergency contacts message
  ///
  /// In en, this message translates to:
  /// **'No emergency contacts added yet.'**
  String get noEmergencyContacts;

  /// Add contact sheet title
  ///
  /// In en, this message translates to:
  /// **'Add Contact'**
  String get addContact;

  /// Edit contact sheet title
  ///
  /// In en, this message translates to:
  /// **'Edit Contact'**
  String get editContact;

  /// Save contact button
  ///
  /// In en, this message translates to:
  /// **'Save Contact'**
  String get saveContact;

  /// Phone number field label
  ///
  /// In en, this message translates to:
  /// **'Phone Number'**
  String get phoneNumber;

  /// Relationship field label
  ///
  /// In en, this message translates to:
  /// **'Relationship'**
  String get relationship;

  /// Relationship field hint
  ///
  /// In en, this message translates to:
  /// **'e.g. Spouse, Parent, Friend'**
  String get relationshipHint;

  /// Delete contact dialog title
  ///
  /// In en, this message translates to:
  /// **'Delete Contact'**
  String get deleteContact;

  /// Delete contact confirmation message
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to remove {name}?'**
  String deleteContactConfirm(String name);

  /// No description provided for @failedToDeleteContact.
  ///
  /// In en, this message translates to:
  /// **'Failed to delete contact'**
  String get failedToDeleteContact;

  /// No description provided for @failedToSaveContact.
  ///
  /// In en, this message translates to:
  /// **'Failed to save contact'**
  String get failedToSaveContact;

  /// No description provided for @couldNotLaunchDialer.
  ///
  /// In en, this message translates to:
  /// **'Could not launch phone dialer'**
  String get couldNotLaunchDialer;

  /// Settings label
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// Logout label
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// Anxiety progress chart title
  ///
  /// In en, this message translates to:
  /// **'Anxiety Progress'**
  String get anxietyProgress;

  /// Default motivation quote
  ///
  /// In en, this message translates to:
  /// **'Every step forward, no matter how small, is progress toward your healing.'**
  String get motivationQuote;

  /// Motivation quote author
  ///
  /// In en, this message translates to:
  /// **'Theraphy Team'**
  String get motivationAuthor;

  /// No description provided for @thoughtRecord.
  ///
  /// In en, this message translates to:
  /// **'Thought Record'**
  String get thoughtRecord;

  /// No description provided for @thoughtRecordSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Challenge your thoughts'**
  String get thoughtRecordSubtitle;

  /// No description provided for @mindfulBreathing.
  ///
  /// In en, this message translates to:
  /// **'Mindful Breathing'**
  String get mindfulBreathing;

  /// No description provided for @mindfulBreathingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Guided relaxation'**
  String get mindfulBreathingSubtitle;

  /// No description provided for @publicSpeaking.
  ///
  /// In en, this message translates to:
  /// **'Public Speaking'**
  String get publicSpeaking;

  /// No description provided for @publicSpeakingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Level 4 Exposure'**
  String get publicSpeakingSubtitle;

  /// No description provided for @socialGreeting.
  ///
  /// In en, this message translates to:
  /// **'Social Greeting'**
  String get socialGreeting;

  /// No description provided for @socialGreetingSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Level 2 Exposure'**
  String get socialGreetingSubtitle;

  /// Language settings screen title
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get languageSettingsTitle;

  /// Language settings subtitle
  ///
  /// In en, this message translates to:
  /// **'Choose your preferred language'**
  String get languageSettingsSubtitle;

  /// Current language label
  ///
  /// In en, this message translates to:
  /// **'Current Language'**
  String get currentLanguage;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['am', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'am':
      return AppLocalizationsAm();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
      'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
      'an issue with the localizations generation tool. Please file an issue '
      'on GitHub with a reproducible sample app and the gen-l10n configuration '
      'that was used.');
}
