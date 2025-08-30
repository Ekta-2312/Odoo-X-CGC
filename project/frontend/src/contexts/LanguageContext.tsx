import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'help_on_way': 'Help is on the way!',
    'dashboard': 'Dashboard',
    'request_assistance': 'Request Assistance',
    'track_request': 'Track Current Request',
    'workshops_nearby': 'Workshops Nearby',
    'emergency_sos': 'Emergency SOS',
    'login_with_google': 'Continue with Google',
    'enter_otp': 'Enter OTP',
    'verify': 'Verify',
    'select_role': 'Select Your Role',
    'vehicle_owner': 'Vehicle Owner',
    'mechanic': 'Mechanic',
    'admin': 'Admin',
    'continue': 'Continue',
    'welcome_back': 'Welcome Back',
    'sign_in': 'Sign in to access your account',
    'current_location': 'Current Location',
    'available': 'Available',
    'busy': 'Busy',
    'closed': 'Closed',
    'km_away': 'km away',
    'rating': 'Rating',
    'response_time': 'Response Time',
    'submit_request': 'Submit Request',
    'processing_payment': 'Processing Payment',
    'payment_successful': 'Payment Successful',
    'verify_email': 'Verify Email',
    'complete_google_signin': 'Complete Google Sign-in',
    'google_authentication': 'Google Authentication',
    'check_gmail_otp': 'Check your Gmail for the OTP',
    'otp_sent_to': 'OTP sent to:',
    'enter_6_digit_otp': 'Enter 6-digit OTP',
    'enter_all_digits': 'Enter all 6 digits',
    'ready_to_verify': '✓ Ready to verify',
    'verify_continue': 'Verify & Continue',
    'verifying': 'Verifying...',
    'time_remaining': 'Time remaining:',
    'resend_otp': 'Resend OTP',
    'invalid_otp': 'Please enter a valid 6-digit OTP',
    'email_required': 'Email is required',
    'verification_successful': '✅ Verification successful!',
    'email_verified_redirecting': '✅ Email verified! Redirecting to registration...',
    'new_otp_sent': '📧 New OTP sent to your email',
    'network_error': 'Network error. Please check your connection and try again.',
    'failed_resend_otp': 'Failed to resend OTP',
    'smart_roadside_assistance': 'Smart Roadside Assistance',
  },
  hi: {
    'help_on_way': 'मदद रास्ते में है!',
    'dashboard': 'डैशबोर्ड',
    'request_assistance': 'सहायता का अनुरोध',
    'track_request': 'वर्तमान अनुरोध ट्रैक करें',
    'workshops_nearby': 'आस-पास की वर्कशॉप',
    'emergency_sos': 'आपातकालीन SOS',
    'login_with_google': 'Google के साथ जारी रखें',
    'enter_otp': 'OTP दर्ज करें',
    'verify': 'सत्यापित करें',
    'select_role': 'अपनी भूमिका चुनें',
    'vehicle_owner': 'वाहन स्वामी',
    'mechanic': 'मैकेनिक',
    'admin': 'व्यवस्थापक',
    'continue': 'जारी रखें',
    'welcome_back': 'वापसी पर स्वागत है',
    'sign_in': 'अपने खाते में साइन इन करें',
    'current_location': 'वर्तमान स्थान',
    'available': 'उपलब्ध',
    'busy': 'व्यस्त',
    'closed': 'बंद',
    'km_away': 'किमी दूर',
    'rating': 'रेटिंग',
    'response_time': 'प्रतिक्रिया समय',
    'submit_request': 'अनुरोध जमा करें',
    'processing_payment': 'भुगतान प्रसंस्करण',
    'payment_successful': 'भुगतान सफल',
    'verify_email': 'ईमेल सत्यापित करें',
    'complete_google_signin': 'Google साइन-इन पूरा करें',
    'google_authentication': 'Google प्रमाणीकरण',
    'check_gmail_otp': 'OTP के लिए अपना Gmail जांचें',
    'otp_sent_to': 'OTP भेजा गया:',
    'enter_6_digit_otp': '6-अंकीय OTP दर्ज करें',
    'enter_all_digits': 'सभी 6 अंक दर्ज करें',
    'ready_to_verify': '✓ सत्यापित करने के लिए तैयार',
    'verify_continue': 'सत्यापित करें और जारी रखें',
    'verifying': 'सत्यापित कर रहे हैं...',
    'time_remaining': 'शेष समय:',
    'resend_otp': 'OTP पुनः भेजें',
    'invalid_otp': 'कृपया एक वैध 6-अंकीय OTP दर्ज करें',
    'email_required': 'ईमेल आवश्यक है',
    'verification_successful': '✅ सत्यापन सफल!',
    'email_verified_redirecting': '✅ ईमेल सत्यापित! पंजीकरण पर पुनर्निर्देशित कर रहे हैं...',
    'new_otp_sent': '📧 आपके ईमेल पर नया OTP भेजा गया',
    'network_error': 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।',
    'failed_resend_otp': 'OTP पुनः भेजने में विफल',
    'smart_roadside_assistance': 'स्मार्ट रोडसाइड सहायता',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
