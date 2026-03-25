# Internationalization (i18n) Documentation

**Smart Medication Dispenser — Multi-Language Support Strategy**

**Version 1.0 — February 2026**

---

## 1. Language Strategy Overview

The Smart Medication Dispenser targets **Switzerland** (primary market) and **international users**. The product must support multiple languages across all platforms: web portal, mobile app, backend API, and device firmware.

### 1.1 Supported Languages

| Language | Locale Code | Region | Priority |
|:---------|:------------|:-------|:---------|
| **French** | `fr-CH` | Romandie (Western Switzerland) | High |
| **German** | `de-CH` | Deutschschweiz (German-speaking Switzerland) | High |
| **Italian** | `it-CH` | Ticino (Italian-speaking Switzerland) | High |
| **English** | `en` | International / Fallback | Medium |

### 1.2 Language Priority by Region

| Swiss Region | Primary Language | Secondary Language | Fallback |
|:-------------|:-----------------|:-------------------|:---------|
| **Romandie** | French (fr-CH) | English (en) | English (en) |
| **Deutschschweiz** | German (de-CH) | English (en) | English (en) |
| **Ticino** | Italian (it-CH) | English (en) | English (en) |
| **International** | English (en) | User preference | English (en) |

### 1.3 Legal Requirements

**Swiss nDSG (New Data Protection Act) Compliance:**

- **Privacy Policy** (`/privacy`) must be available in **FR, DE, IT** (Swiss official languages)
- **Terms of Service** (`/terms`) must be available in **FR, DE, IT**
- **Cookie Policy** (`/cookies`) must be available in **FR, DE, IT**
- Legal documents must be **legally reviewed** and **translated by certified translators**
- Users must be able to **accept/reject** terms in their preferred language

### 1.4 Language Detection Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    LANGUAGE DETECTION                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User Setting (stored in database)                       │
│     └─> Highest priority (if set)                          │
│                                                              │
│  2. Browser/System Preference                               │
│     └─> Accept-Language header (web)                       │
│     └─> System locale (mobile)                             │
│                                                              │
│  3. Geographic Detection (optional)                         │
│     └─> IP-based region detection                          │
│                                                              │
│  4. Fallback                                                │
│     └─> English (en)                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Web Portal Internationalization (React + Vite)

### 2.1 Technology Stack

| Component | Library | Version |
|:----------|:--------|:--------|
| **i18n Framework** | react-i18next | ^14.0.0 |
| **i18n Core** | i18next | ^23.0.0 |
| **Language Detection** | i18next-browser-languagedetector | ^8.0.0 |
| **Backend** | i18next-http-backend | ^2.4.0 |

### 2.2 Installation

```bash
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

### 2.3 Translation File Structure

```
web/
├── public/
│   └── locales/
│       ├── en/
│       │   ├── common.json          # Common UI elements
│       │   ├── auth.json            # Authentication pages
│       │   ├── dashboard.json       # Dashboard page
│       │   ├── devices.json         # Device management
│       │   ├── schedules.json       # Schedule management
│       │   ├── notifications.json   # Notifications
│       │   └── settings.json        # Settings page
│       │
│       ├── fr-CH/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   ├── devices.json
│       │   ├── schedules.json
│       │   ├── notifications.json
│       │   └── settings.json
│       │
│       ├── de-CH/
│       │   └── [same structure]
│       │
│       └── it-CH/
│           └── [same structure]
│
└── src/
    └── i18n/
        ├── config.ts                # i18next configuration
        └── resources.ts             # Type definitions
```

### 2.4 i18next Configuration

**`src/i18n/config.ts`:**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Supported languages
    supportedLngs: ['en', 'fr-CH', 'de-CH', 'it-CH'],
    
    // Default namespace
    defaultNS: 'common',
    
    // Fallback language
    fallbackLng: 'en',
    
    // Language detection options
    detection: {
      // Order of detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language preference
      caches: ['localStorage'],
      
      // Lookup localStorage key
      lookupLocalStorage: 'i18nextLng',
      
      // Convert detected language to locale code
      convertDetectedLanguage: (lng: string) => {
        // Map browser languages to our locale codes
        const languageMap: Record<string, string> = {
          'fr': 'fr-CH',
          'de': 'de-CH',
          'it': 'it-CH',
          'en': 'en',
        };
        
        // Check for exact match first
        if (languageMap[lng]) {
          return languageMap[lng];
        }
        
        // Check for language prefix (e.g., 'fr-FR' -> 'fr-CH')
        const langPrefix = lng.split('-')[0];
        return languageMap[langPrefix] || 'en';
      },
    },
    
    // Backend configuration (loads JSON files)
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // React i18next options
    react: {
      useSuspense: false, // Disable suspense for better error handling
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Debug mode (enable in development)
    debug: import.meta.env.DEV,
  });

export default i18n;
```

### 2.5 Translation Key Naming Convention

**Format:** `{page}.{section}.{element}`

**Examples:**

```json
{
  "auth.login.title": "Login",
  "auth.login.email": "Email",
  "auth.login.password": "Password",
  "auth.login.submit": "Sign In",
  
  "dashboard.welcome": "Welcome, {{name}}",
  "dashboard.todaySchedule": "Today's Schedule",
  "dashboard.adherence": "Adherence Rate",
  
  "devices.list.title": "Devices",
  "devices.list.add": "Add Device",
  "devices.detail.name": "Device Name",
  "devices.detail.status": "Status",
  
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.confirm": "Confirm",
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success"
}
```

### 2.6 Usage in React Components

**Basic Translation:**

```typescript
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation('auth');
  
  return (
    <div>
      <h1>{t('login.title')}</h1>
      <input placeholder={t('login.email')} />
      <button>{t('login.submit')}</button>
    </div>
  );
}
```

**With Interpolation:**

```typescript
function Dashboard() {
  const { t } = useTranslation('dashboard');
  const userName = 'John Doe';
  
  return (
    <h1>{t('welcome', { name: userName })}</h1>
    // Output: "Welcome, John Doe"
  );
}
```

**Pluralization:**

```typescript
function NotificationBadge({ count }: { count: number }) {
  const { t } = useTranslation('notifications');
  
  return (
    <span>
      {t('unreadCount', { count })}
      // English: "5 unread notifications"
      // French: "5 notifications non lues"
    </span>
  );
}
```

**Translation JSON with Pluralization:**

```json
{
  "notifications.unreadCount": "{{count}} unread notification",
  "notifications.unreadCount_plural": "{{count}} unread notifications"
}
```

### 2.7 Language Switcher Component

**`src/components/LanguageSwitcher.tsx`:**

```typescript
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr-CH', label: 'Français', flag: '🇨🇭' },
  { code: 'de-CH', label: 'Deutsch', flag: '🇨🇭' },
  { code: 'it-CH', label: 'Italiano', flag: '🇨🇭' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Optionally sync with backend user preference
    // await updateUserLanguagePreference(langCode);
  };
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  
  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### 2.8 Date and Time Formatting

**Using Intl.DateTimeFormat:**

```typescript
import { useTranslation } from 'react-i18next';

function DateDisplay({ date }: { date: Date }) {
  const { i18n } = useTranslation();
  
  // Swiss date format: DD.MM.YYYY
  const formattedDate = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-GB' : i18n.language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
  
  return <span>{formattedDate}</span>;
}

function TimeDisplay({ time }: { time: Date }) {
  const { i18n } = useTranslation();
  
  // Swiss time format: HH:mm (24-hour)
  const formattedTime = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-GB' : i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  }).format(time);
  
  return <span>{formattedTime}</span>;
}
```

**Reusable Date/Time Formatter Hook:**

```typescript
// src/hooks/useDateFormat.ts
import { useTranslation } from 'react-i18next';

export function useDateFormat() {
  const { i18n } = useTranslation();
  
  const locale = i18n.language === 'en' ? 'en-GB' : i18n.language;
  
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  };
  
  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dateObj);
  };
  
  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(dateObj);
  };
  
  return { formatDate, formatTime, formatDateTime };
}
```

### 2.9 Number Formatting (Swiss Conventions)

**Swiss Number Format:** `1'000.50` (apostrophe thousands separator, dot decimal separator)

```typescript
import { useTranslation } from 'react-i18next';

function NumberDisplay({ value }: { value: number }) {
  const { i18n } = useTranslation();
  
  // Swiss number format
  const formattedNumber = new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  
  return <span>{formattedNumber}</span>;
  // Output: 1'000.50
}
```

**Currency Formatting (CHF):**

```typescript
function CurrencyDisplay({ amount }: { amount: number }) {
  const { i18n } = useTranslation();
  
  const formattedCurrency = new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return <span>{formattedCurrency}</span>;
  // Output: CHF 44.99
}
```

**Reusable Number Formatter Hook:**

```typescript
// src/hooks/useNumberFormat.ts
import { useTranslation } from 'react-i18next';

export function useNumberFormat() {
  const { i18n } = useTranslation();
  
  // Use de-CH locale for Swiss number formatting (apostrophe separator)
  const locale = 'de-CH';
  
  const formatNumber = (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  return { formatNumber, formatCurrency };
}
```

### 2.10 RTL Support

**Not Required:** All supported languages (French, German, Italian, English) are **left-to-right (LTR)** languages. No RTL support needed for this product.

**Future-Proofing:** If RTL languages are added in the future, use CSS logical properties:

```css
/* Instead of: */
margin-left: 1rem;

/* Use: */
margin-inline-start: 1rem;
```

---

## 3. Mobile App Internationalization (React Native / Expo)

### 3.1 Technology Stack

| Component | Library | Version |
|:----------|:--------|:--------|
| **i18n Framework** | react-i18next | ^14.0.0 |
| **i18n Core** | i18next | ^23.0.0 |
| **System Locale** | expo-localization | ~13.0.0 |

### 3.2 Installation

```bash
npx expo install expo-localization
npm install react-i18next i18next
```

### 3.3 Translation File Structure

```
mobile/
├── assets/
│   └── locales/
│       ├── en/
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── home.json
│       │   ├── devices.json
│       │   ├── history.json
│       │   └── notifications.json
│       │
│       ├── fr-CH/
│       │   └── [same structure]
│       │
│       ├── de-CH/
│       │   └── [same structure]
│       │
│       └── it-CH/
│           └── [same structure]
│
└── src/
    └── i18n/
        ├── config.ts
        └── resources.ts
```

### 3.4 i18next Configuration (React Native)

**`src/i18n/config.ts`:**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import enCommon from '../../assets/locales/en/common.json';
import enAuth from '../../assets/locales/en/auth.json';
import frCHCommon from '../../assets/locales/fr-CH/common.json';
import frCHAuth from '../../assets/locales/fr-CH/auth.json';
// ... import all namespaces for all languages

const resources = {
  'en': {
    common: enCommon,
    auth: enAuth,
    // ... other namespaces
  },
  'fr-CH': {
    common: frCHCommon,
    auth: frCHAuth,
    // ... other namespaces
  },
  // ... other languages
};

// Detect system language
const getSystemLanguage = (): string => {
  const systemLocale = Localization.locale;
  
  // Map system locale to our locale codes
  const languageMap: Record<string, string> = {
    'fr': 'fr-CH',
    'de': 'de-CH',
    'it': 'it-CH',
    'en': 'en',
  };
  
  const langPrefix = systemLocale.split('-')[0];
  return languageMap[langPrefix] || 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getSystemLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React Native handles escaping
    },
    
    // Load user preference from AsyncStorage
    init: async () => {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
        i18n.changeLanguage(savedLanguage);
      }
    },
  });

export default i18n;
```

### 3.5 Usage in React Native Components

```typescript
import { useTranslation } from 'react-i18next';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';

function LoginScreen() {
  const { t } = useTranslation('auth');
  
  return (
    <View>
      <Text>{t('login.title')}</Text>
      <TextInput placeholder={t('login.email')} />
      <TouchableOpacity>
        <Text>{t('login.submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3.6 Date and Time Formatting (date-fns)

**Installation:**

```bash
npm install date-fns
```

**Usage:**

```typescript
import { format } from 'date-fns';
import { fr, de, it, enGB } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

function DateDisplay({ date }: { date: Date }) {
  const { i18n } = useTranslation();
  
  const localeMap: Record<string, Locale> = {
    'fr-CH': fr,
    'de-CH': de,
    'it-CH': it,
    'en': enGB,
  };
  
  const locale = localeMap[i18n.language] || enGB;
  
  // Swiss date format: DD.MM.YYYY
  const formattedDate = format(date, 'dd.MM.yyyy', { locale });
  
  return <Text>{formattedDate}</Text>;
}

function TimeDisplay({ time }: { time: Date }) {
  const { i18n } = useTranslation();
  
  const localeMap: Record<string, Locale> = {
    'fr-CH': fr,
    'de-CH': de,
    'it-CH': it,
    'en': enGB,
  };
  
  const locale = localeMap[i18n.language] || enGB;
  
  // Swiss time format: HH:mm (24-hour)
  const formattedTime = format(time, 'HH:mm', { locale });
  
  return <Text>{formattedTime}</Text>;
}
```

### 3.7 Pluralization Rules

**Translation JSON:**

```json
{
  "notifications.unreadCount_one": "{{count}} notification non lue",
  "notifications.unreadCount_other": "{{count}} notifications non lues"
}
```

**Usage:**

```typescript
function NotificationBadge({ count }: { count: number }) {
  const { t } = useTranslation('notifications');
  
  return (
    <Text>
      {t('unreadCount', { count })}
    </Text>
  );
}
```

### 3.8 Language Switcher (Mobile)

```typescript
import { useTranslation } from 'react-i18next';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr-CH', label: 'Français' },
  { code: 'de-CH', label: 'Deutsch' },
  { code: 'it-CH', label: 'Italiano' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    await AsyncStorage.setItem('userLanguage', langCode);
    // Optionally sync with backend
    // await updateUserLanguagePreference(langCode);
  };
  
  return (
    <Picker
      selectedValue={i18n.language}
      onValueChange={handleLanguageChange}
    >
      {languages.map((lang) => (
        <Picker.Item
          key={lang.code}
          label={lang.label}
          value={lang.code}
        />
      ))}
    </Picker>
  );
}
```

---

## 4. Backend Internationalization (ASP.NET Core 8)

### 4.1 Request Culture Middleware

**`Program.cs`:**

```csharp
using Microsoft.AspNetCore.Localization;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

// Add localization services
builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    var supportedCultures = new[]
    {
        new CultureInfo("en"),
        new CultureInfo("fr-CH"),
        new CultureInfo("de-CH"),
        new CultureInfo("it-CH")
    };
    
    options.DefaultRequestCulture = new RequestCulture("en");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    
    // Language detection from Accept-Language header
    options.RequestCultureProviders.Insert(0, new AcceptLanguageHeaderRequestCultureProvider());
});

var app = builder.Build();

// Use request localization middleware
app.UseRequestLocalization();

// ... rest of middleware pipeline
```

### 4.2 Accept-Language Header Processing

**Custom Request Culture Provider:**

```csharp
// Infrastructure/RequestCulture/AcceptLanguageHeaderRequestCultureProvider.cs
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Http;

public class AcceptLanguageHeaderRequestCultureProvider : RequestCultureProvider
{
    private static readonly Dictionary<string, string> LanguageMap = new()
    {
        { "fr", "fr-CH" },
        { "de", "de-CH" },
        { "it", "it-CH" },
        { "en", "en" }
    };
    
    public override Task<ProviderCultureResult?> DetermineProviderCultureResult(HttpContext httpContext)
    {
        if (httpContext == null)
            throw new ArgumentNullException(nameof(httpContext));
        
        var acceptLanguageHeader = httpContext.Request.Headers["Accept-Language"].ToString();
        
        if (string.IsNullOrWhiteSpace(acceptLanguageHeader))
            return NullProviderCultureResult;
        
        // Parse Accept-Language header (e.g., "fr-CH,fr;q=0.9,en;q=0.8")
        var languages = acceptLanguageHeader
            .Split(',')
            .Select(lang => lang.Split(';')[0].Trim().ToLower())
            .ToList();
        
        foreach (var lang in languages)
        {
            // Check exact match first
            if (LanguageMap.ContainsKey(lang))
            {
                return Task.FromResult<ProviderCultureResult?>(
                    new ProviderCultureResult(LanguageMap[lang])
                );
            }
            
            // Check language prefix (e.g., "fr-FR" -> "fr-CH")
            var langPrefix = lang.Split('-')[0];
            if (LanguageMap.ContainsKey(langPrefix))
            {
                return Task.FromResult<ProviderCultureResult?>(
                    new ProviderCultureResult(LanguageMap[langPrefix])
                );
            }
        }
        
        return NullProviderCultureResult;
    }
}
```

### 4.3 Localized Error Messages

**Resource Files Structure:**

```
Api/
└── Resources/
    ├── Controllers/
    │   ├── AuthController.en.resx
    │   ├── AuthController.fr-CH.resx
    │   ├── AuthController.de-CH.resx
    │   └── AuthController.it-CH.resx
    │
    └── Shared/
        ├── Errors.en.resx
        ├── Errors.fr-CH.resx
        ├── Errors.de-CH.resx
        └── Errors.it-CH.resx
```

**Example Resource File (`Errors.en.resx`):**

```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
  <data name="InvalidCredentials" xml:space="preserve">
    <value>Invalid email or password.</value>
  </data>
  <data name="UserNotFound" xml:space="preserve">
    <value>User not found.</value>
  </data>
  <data name="DeviceNotFound" xml:space="preserve">
    <value>Device not found.</value>
  </data>
</root>
```

**Example Resource File (`Errors.fr-CH.resx`):**

```xml
<?xml version="1.0" encoding="utf-8"?>
<root>
  <data name="InvalidCredentials" xml:space="preserve">
    <value>Email ou mot de passe invalide.</value>
  </data>
  <data name="UserNotFound" xml:space="preserve">
    <value>Utilisateur introuvable.</value>
  </data>
  <data name="DeviceNotFound" xml:space="preserve">
    <value>Appareil introuvable.</value>
  </data>
</root>
```

**Usage in Controllers:**

```csharp
using Microsoft.Extensions.Localization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IStringLocalizer<AuthController> _localizer;
    private readonly IStringLocalizer<SharedErrors> _errorLocalizer;
    
    public AuthController(
        IStringLocalizer<AuthController> localizer,
        IStringLocalizer<SharedErrors> errorLocalizer)
    {
        _localizer = localizer;
        _errorLocalizer = errorLocalizer;
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // ... authentication logic
        
        if (!isValid)
        {
            return BadRequest(new { 
                error = _errorLocalizer["InvalidCredentials"].Value 
            });
        }
        
        return Ok(new { 
            message = _localizer["LoginSuccess"].Value 
        });
    }
}
```

### 4.4 Localized Email Templates

**Email Template Structure:**

```
Infrastructure/
└── Email/
    └── Templates/
        ├── en/
        │   ├── WelcomeEmail.html
        │   ├── PasswordReset.html
        │   └── MedicationReminder.html
        │
        ├── fr-CH/
        │   ├── WelcomeEmail.html
        │   ├── PasswordReset.html
        │   └── MedicationReminder.html
        │
        ├── de-CH/
        │   └── [same structure]
        │
        └── it-CH/
            └── [same structure]
```

**Email Service with Localization:**

```csharp
// Infrastructure/Email/EmailService.cs
public class EmailService : IEmailService
{
    private readonly IStringLocalizer<EmailTemplates> _localizer;
    private readonly IWebHostEnvironment _env;
    
    public EmailService(
        IStringLocalizer<EmailTemplates> localizer,
        IWebHostEnvironment env)
    {
        _localizer = localizer;
        _env = env;
    }
    
    public async Task SendWelcomeEmailAsync(string email, string name, string language)
    {
        var culture = new CultureInfo(language);
        CultureInfo.CurrentCulture = culture;
        CultureInfo.CurrentUICulture = culture;
        
        var templatePath = Path.Combine(
            _env.ContentRootPath,
            "Infrastructure",
            "Email",
            "Templates",
            language,
            "WelcomeEmail.html"
        );
        
        var template = await File.ReadAllTextAsync(templatePath);
        
        // Replace placeholders
        var body = template
            .Replace("{{name}}", name)
            .Replace("{{welcomeMessage}}", _localizer["WelcomeMessage"].Value);
        
        // Send email using SMTP client
        // ...
    }
}
```

### 4.5 Localized Notification Messages

**Notification Model:**

```csharp
// Domain/Entities/Notification.cs
public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } // "MedicationReminder", "DoseMissed", etc.
    public string TitleKey { get; set; } // Translation key for title
    public string BodyKey { get; set; } // Translation key for body
    public Dictionary<string, object> Parameters { get; set; } // Interpolation parameters
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}
```

**Notification Service:**

```csharp
// Application/Notifications/CreateNotificationCommand.cs
public class CreateNotificationCommand : IRequest<Guid>
{
    public Guid UserId { get; set; }
    public string Type { get; set; }
    public Dictionary<string, object> Parameters { get; set; }
}

public class CreateNotificationHandler : IRequestHandler<CreateNotificationCommand, Guid>
{
    private readonly IStringLocalizer<NotificationMessages> _localizer;
    private readonly INotificationRepository _repository;
    
    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Type = request.Type,
            TitleKey = $"{request.Type}.Title",
            BodyKey = $"{request.Type}.Body",
            Parameters = request.Parameters,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };
        
        await _repository.AddAsync(notification);
        return notification.Id;
    }
}
```

**Notification DTO with Localized Content:**

```csharp
// Application/DTOs/NotificationDto.cs
public class NotificationDto
{
    public Guid Id { get; set; }
    public string Type { get; set; }
    public string Title { get; set; }
    public string Body { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

// Application/Notifications/GetNotificationsQuery.cs
public class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, List<NotificationDto>>
{
    private readonly IStringLocalizer<NotificationMessages> _localizer;
    private readonly INotificationRepository _repository;
    
    public async Task<List<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _repository.GetByUserIdAsync(request.UserId);
        
        // Get user's preferred language from database
        var userLanguage = await GetUserLanguageAsync(request.UserId);
        var culture = new CultureInfo(userLanguage);
        CultureInfo.CurrentUICulture = culture;
        
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Type = n.Type,
            Title = _localizer[n.TitleKey, n.Parameters].Value,
            Body = _localizer[n.BodyKey, n.Parameters].Value,
            CreatedAt = n.CreatedAt,
            IsRead = n.IsRead
        }).ToList();
    }
}
```

---

## 5. Device Firmware Internationalization (ESP32-S3 / LVGL)

### 5.1 Font Configuration

**LVGL Font Setup:**

```c
// fonts.h
#include "lvgl.h"

// Montserrat Regular 24px (standard UI)
LV_FONT_DECLARE(montserrat_24);

// Montserrat Regular 32px (elderly-friendly large text)
LV_FONT_DECLARE(montserrat_32);

// Character set: Latin Extended
// Covers: àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ
//         ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ
//         German: äöüß
//         French: àâäéèêëïîôùûüÿç
//         Italian: àèéìíîòóù
```

**Font Generation (using LVGL Font Converter):**

```bash
# Generate font with Latin Extended character set
lv_font_conv --font Montserrat-Regular.ttf \
  --size 24 \
  --range 0x0020-0x007F,0x00A0-0x017F,0x0180-0x024F \
  --format lvgl \
  --output montserrat_24.c \
  --bpp 4
```

### 5.2 UI String Storage

**Option 1: Compiled into Firmware (Recommended for small strings)**

```c
// strings.h
#ifndef STRINGS_H
#define STRINGS_H

typedef enum {
    LANG_EN,
    LANG_FR_CH,
    LANG_DE_CH,
    LANG_IT_CH
} language_t;

// English strings
const char* const STRINGS_EN[] = {
    "Welcome",
    "Take Medication",
    "Dose Confirmed",
    "Low Battery",
    "No Medication",
    "Settings",
    "Language",
    // ... more strings
};

// French strings
const char* const STRINGS_FR_CH[] = {
    "Bienvenue",
    "Prendre le médicament",
    "Dose confirmée",
    "Batterie faible",
    "Pas de médicament",
    "Paramètres",
    "Langue",
    // ... more strings
};

// German strings
const char* const STRINGS_DE_CH[] = {
    "Willkommen",
    "Medikament einnehmen",
    "Dosis bestätigt",
    "Niedriger Batteriestand",
    "Kein Medikament",
    "Einstellungen",
    "Sprache",
    // ... more strings
};

// Italian strings
const char* const STRINGS_IT_CH[] = {
    "Benvenuto",
    "Prendere il farmaco",
    "Dose confermata",
    "Batteria scarica",
    "Nessun farmaco",
    "Impostazioni",
    "Lingua",
    // ... more strings
};

// String ID enum
typedef enum {
    STR_WELCOME,
    STR_TAKE_MEDICATION,
    STR_DOSE_CONFIRMED,
    STR_LOW_BATTERY,
    STR_NO_MEDICATION,
    STR_SETTINGS,
    STR_LANGUAGE,
    // ... more IDs
    STR_COUNT
} string_id_t;

// Get localized string
const char* get_string(string_id_t id, language_t lang);

#endif // STRINGS_H
```

**Implementation:**

```c
// strings.c
#include "strings.h"

const char* get_string(string_id_t id, language_t lang) {
    const char* const* strings;
    
    switch (lang) {
        case LANG_FR_CH:
            strings = STRINGS_FR_CH;
            break;
        case LANG_DE_CH:
            strings = STRINGS_DE_CH;
            break;
        case LANG_IT_CH:
            strings = STRINGS_IT_CH;
            break;
        case LANG_EN:
        default:
            strings = STRINGS_EN;
            break;
    }
    
    if (id >= 0 && id < STR_COUNT) {
        return strings[id];
    }
    
    return STRINGS_EN[STR_WELCOME]; // Fallback
}
```

**Option 2: SD Card Storage (For larger text or future updates)**

```c
// Load strings from SD card JSON file
// /locales/en/strings.json
// /locales/fr-CH/strings.json
// etc.

bool load_strings_from_sd(language_t lang) {
    char path[64];
    snprintf(path, sizeof(path), "/locales/%s/strings.json", get_lang_code(lang));
    
    // Read JSON file from SD card
    // Parse and store in memory
    // ...
}
```

### 5.3 Audio Prompts

**Audio File Structure:**

```
firmware/
└── audio/
    ├── en/
    │   ├── welcome.wav
    │   ├── take_medication.wav
    │   ├── dose_confirmed.wav
    │   ├── low_battery.wav
    │   └── error.wav
    │
    ├── fr-CH/
    │   ├── welcome.wav
    │   ├── take_medication.wav
    │   ├── dose_confirmed.wav
    │   ├── low_battery.wav
    │   └── error.wav
    │
    ├── de-CH/
    │   └── [same structure]
    │
    └── it-CH/
        └── [same structure]
```

**Audio File Specifications:**

| Parameter | Value |
|:----------|:------|
| **Format** | WAV (PCM) |
| **Sample Rate** | 16 kHz (sufficient for speech) |
| **Bit Depth** | 16-bit |
| **Channels** | Mono |
| **Total Size** | ~5 MB (all languages combined) |
| **Storage** | SPIFFS or SD card |

**Audio Playback Code:**

```c
// audio.h
typedef enum {
    AUDIO_WELCOME,
    AUDIO_TAKE_MEDICATION,
    AUDIO_DOSE_CONFIRMED,
    AUDIO_LOW_BATTERY,
    AUDIO_ERROR
} audio_id_t;

void play_audio(audio_id_t id, language_t lang);
```

```c
// audio.c
#include "audio.h"
#include "SPIFFS.h"

void play_audio(audio_id_t id, language_t lang) {
    const char* lang_dir;
    const char* filename;
    
    // Map language to directory
    switch (lang) {
        case LANG_FR_CH: lang_dir = "/audio/fr-CH/"; break;
        case LANG_DE_CH: lang_dir = "/audio/de-CH/"; break;
        case LANG_IT_CH: lang_dir = "/audio/it-CH/"; break;
        case LANG_EN:
        default: lang_dir = "/audio/en/"; break;
    }
    
    // Map audio ID to filename
    switch (id) {
        case AUDIO_WELCOME: filename = "welcome.wav"; break;
        case AUDIO_TAKE_MEDICATION: filename = "take_medication.wav"; break;
        case AUDIO_DOSE_CONFIRMED: filename = "dose_confirmed.wav"; break;
        case AUDIO_LOW_BATTERY: filename = "low_battery.wav"; break;
        case AUDIO_ERROR: filename = "error.wav"; break;
    }
    
    char path[128];
    snprintf(path, sizeof(path), "%s%s", lang_dir, filename);
    
    // Play audio file from SPIFFS/SD card
    // Using I2S audio output or DAC
    // ...
}
```

### 5.4 Language Selection and Synchronization

**Language Setting Storage:**

```c
// settings.h
typedef struct {
    language_t current_language;
    // ... other settings
} device_settings_t;

// Load language from EEPROM/Flash
language_t get_device_language(void);

// Save language to EEPROM/Flash
void set_device_language(language_t lang);
```

**Language Sync from Mobile App:**

```c
// When device receives language update via BLE/HTTP API
void update_device_language(language_t new_lang) {
    set_device_language(new_lang);
    
    // Update UI immediately
    refresh_ui_strings(new_lang);
    
    // Save to flash
    save_settings();
}
```

**On-Device Language Switching:**

```c
// Language selection screen in device settings
void show_language_selection_screen(void) {
    lv_obj_t* list = lv_list_create(lv_scr_act());
    
    lv_list_add_btn(list, NULL, "English", language_selected_cb);
    lv_list_add_btn(list, NULL, "Français", language_selected_cb);
    lv_list_add_btn(list, NULL, "Deutsch", language_selected_cb);
    lv_list_add_btn(list, NULL, "Italiano", language_selected_cb);
}

void language_selected_cb(lv_event_t* e) {
    // Get selected language from button
    // Update device language
    // Refresh UI
    // Sync to backend via API
}
```

---

## 6. Translation Management

### 6.1 Translation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                  TRANSLATION WORKFLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Developer creates/updates translation keys              │
│     └─> Add keys to English (en) JSON files                 │
│                                                              │
│  2. Export translation files                                │
│     └─> Use i18next-parser or manual export                │
│                                                              │
│  3. Send to translators                                     │
│     └─> Upload to Crowdin/Lokalise or send to team         │
│                                                              │
│  4. Translation review                                       │
│     └─> Native speakers review translations                 │
│                                                              │
│  5. Import translated files                                  │
│     └─> Download from translation tool or receive files     │
│                                                              │
│  6. Quality assurance                                        │
│     └─> Test UI with translated strings                     │
│                                                              │
│  7. Deploy                                                   │
│     └─> Commit to repository → Build → Deploy               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Translation Key Naming Convention

**Format:** `{page}.{section}.{element}`

**Examples:**

| Key | Description |
|:----|:------------|
| `auth.login.title` | Login page title |
| `auth.login.email` | Email input label |
| `auth.login.password` | Password input label |
| `auth.login.submit` | Submit button text |
| `dashboard.welcome` | Welcome message |
| `dashboard.todaySchedule` | Today's schedule section title |
| `devices.list.title` | Device list page title |
| `devices.list.add` | Add device button |
| `devices.detail.name` | Device name label |
| `common.save` | Save button (reusable) |
| `common.cancel` | Cancel button (reusable) |
| `common.delete` | Delete button (reusable) |

**Nested Keys (Alternative):**

```json
{
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In"
    }
  }
}
```

### 6.3 Recommended Translation Tools

| Tool | Type | Features | Cost |
|:-----|:-----|:----------|:-----|
| **Crowdin** | Cloud SaaS | Collaborative translation, context screenshots, API integration | Paid (free tier available) |
| **Lokalise** | Cloud SaaS | Real-time collaboration, over-the-air updates, integrations | Paid (free tier available) |
| **i18next-parser** | CLI Tool | Extract keys from code, generate JSON files | Free (open source) |
| **POEditor** | Cloud SaaS | Translation management, glossary, QA | Paid (free tier available) |

### 6.4 Missing Translation Handling

**Fallback Strategy:**

1. **Primary:** Use translation from current language
2. **Secondary:** Fall back to English (`en`)
3. **Tertiary:** Display translation key (e.g., `auth.login.title`)

**Implementation (React):**

```typescript
// i18next config
i18n.init({
  fallbackLng: 'en',
  fallbackNS: 'common',
  
  // Show key if translation missing
  saveMissing: true,
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`Missing translation: ${lng}/${ns}/${key}`);
  },
  
  // Return key if translation missing
  returnEmptyString: false,
  returnNull: false,
});
```

### 6.5 Translation Coverage Tracking

**Coverage Metrics:**

| Language | Total Keys | Translated | Missing | Coverage |
|:---------|:-----------|:-----------|:--------|:---------|
| **English (en)** | 450 | 450 | 0 | 100% |
| **French (fr-CH)** | 450 | 445 | 5 | 98.9% |
| **German (de-CH)** | 450 | 448 | 2 | 99.6% |
| **Italian (it-CH)** | 450 | 440 | 10 | 97.8% |

**Automated Coverage Check:**

```bash
# Script to check translation coverage
#!/bin/bash

LANGUAGES=("en" "fr-CH" "de-CH" "it-CH")
NAMESPACES=("common" "auth" "dashboard" "devices" "schedules" "notifications" "settings")

for lang in "${LANGUAGES[@]}"; do
  echo "Checking $lang..."
  for ns in "${NAMESPACES[@]}"; do
    en_file="public/locales/en/${ns}.json"
    lang_file="public/locales/${lang}/${ns}.json"
    
    if [ ! -f "$lang_file" ]; then
      echo "  ❌ Missing: ${ns}.json"
      continue
    fi
    
    # Count keys in English file
    en_keys=$(jq 'paths(scalars) | join(".")' "$en_file" | wc -l)
    
    # Count keys in language file
    lang_keys=$(jq 'paths(scalars) | join(".")' "$lang_file" | wc -l)
    
    if [ "$en_keys" -ne "$lang_keys" ]; then
      echo "  ⚠️  ${ns}.json: $lang_keys/$en_keys keys"
    else
      echo "  ✅ ${ns}.json: Complete"
    fi
  done
done
```

---

## 7. Date, Time & Number Formatting

### 7.1 Swiss Date Format

**Format:** `DD.MM.YYYY`

| Language | Format | Example |
|:---------|:-------|:--------|
| **French (fr-CH)** | DD.MM.YYYY | 10.02.2026 |
| **German (de-CH)** | DD.MM.YYYY | 10.02.2026 |
| **Italian (it-CH)** | DD.MM.YYYY | 10.02.2026 |
| **English (en)** | DD/MM/YYYY | 10/02/2026 |

**Implementation:**

```typescript
// Web Portal
const formatDate = (date: Date, locale: string): string => {
  const swissLocale = locale === 'en' ? 'en-GB' : locale;
  return new Intl.DateTimeFormat(swissLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Mobile App (date-fns)
import { format } from 'date-fns';
import { fr, de, it, enGB } from 'date-fns/locale';

const formatDate = (date: Date, locale: string): string => {
  const localeMap = {
    'fr-CH': fr,
    'de-CH': de,
    'it-CH': it,
    'en': enGB,
  };
  return format(date, 'dd.MM.yyyy', { locale: localeMap[locale] });
};
```

### 7.2 Swiss Time Format

**Format:** `HH:mm` (24-hour)

| Language | Format | Example |
|:---------|:-------|:--------|
| **All Languages** | HH:mm | 14:30 |

**Implementation:**

```typescript
const formatTime = (date: Date, locale: string): string => {
  const swissLocale = locale === 'en' ? 'en-GB' : locale;
  return new Intl.DateTimeFormat(swissLocale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // 24-hour format
  }).format(date);
};
```

### 7.3 Swiss Number Format

**Format:** `1'000.50` (apostrophe thousands separator, dot decimal separator)

| Language | Format | Example |
|:---------|:-------|:--------|
| **All Languages** | `'` (thousands), `.` (decimal) | 1'000.50 |

**Implementation:**

```typescript
const formatNumber = (value: number, decimals: number = 2): string => {
  // Use de-CH locale for Swiss number formatting
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  // Output: 1'000.50
};
```

### 7.4 Currency Formatting (CHF)

**Format:** `CHF 44.99`

| Language | Format | Example |
|:---------|:-------|:--------|
| **All Languages** | CHF {amount} | CHF 44.99 |

**Implementation:**

```typescript
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  // Output: CHF 44.99
};
```

### 7.5 Timezone Handling

**Timezone:** `Europe/Zurich` (CET/CEST)

| Period | Timezone | UTC Offset |
|:-------|:---------|:-----------|
| **Winter (CET)** | Central European Time | UTC+1 |
| **Summer (CEST)** | Central European Summer Time | UTC+2 |

**Medication Time Display:**

- **Always display in user's local timezone** (Europe/Zurich for Swiss users)
- **Store in UTC** in database
- **Convert to local time** when displaying

**Implementation:**

```typescript
// Backend (ASP.NET Core)
public DateTime GetLocalTime(DateTime utcTime, string timezoneId = "Europe/Zurich")
{
    var timezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
    return TimeZoneInfo.ConvertTimeFromUtc(utcTime, timezone);
}

// Frontend (React)
import { formatInTimeZone } from 'date-fns-tz';

const formatMedicationTime = (utcTime: Date): string => {
  const zurichTime = formatInTimeZone(utcTime, 'Europe/Zurich', 'HH:mm');
  return zurichTime;
};
```

---

## 8. Content Localization

### 8.1 User-Facing Content Requiring Translation

#### **Web Portal**

| Category | Content Type | Files |
|:---------|:-------------|:------|
| **Authentication** | Login, Register, Password Reset | `auth.json` |
| **Dashboard** | Welcome message, statistics, charts | `dashboard.json` |
| **Devices** | Device list, device detail, container management | `devices.json` |
| **Schedules** | Schedule creation, editing, medication times | `schedules.json` |
| **Notifications** | Notification center, alert messages | `notifications.json` |
| **Settings** | User settings, preferences, language switcher | `settings.json` |
| **Common UI** | Buttons, labels, placeholders, tooltips | `common.json` |

#### **Mobile App**

| Category | Content Type | Files |
|:---------|:-------------|:------|
| **Authentication** | Login, Register | `auth.json` |
| **Home** | Today's schedule, quick actions | `home.json` |
| **Devices** | Device list, device status | `devices.json` |
| **History** | Dispense event history | `history.json` |
| **Notifications** | Push notifications, in-app alerts | `notifications.json` |
| **Common UI** | Buttons, labels, placeholders | `common.json` |

#### **Backend API**

| Category | Content Type | Files |
|:---------|:-------------|:------|
| **Error Messages** | Validation errors, API errors | `Errors.resx` |
| **Email Templates** | Welcome email, password reset, reminders | HTML templates |
| **Notification Messages** | Push notification titles and bodies | `NotificationMessages.resx` |

#### **Device Firmware**

| Category | Content Type | Storage |
|:---------|:-------------|:--------|
| **UI Strings** | Screen labels, button text | Compiled strings |
| **Audio Prompts** | Voice announcements | WAV files |

### 8.2 Legal Documents

**Required Translations:** FR, DE, IT (Swiss nDSG compliance)

| Document | Path | Languages |
|:---------|:-----|:----------|
| **Privacy Policy** | `/privacy` | FR, DE, IT, EN |
| **Terms of Service** | `/terms` | FR, DE, IT, EN |
| **Cookie Policy** | `/cookies` | FR, DE, IT, EN |

**File Structure:**

```
web/
└── public/
    └── legal/
        ├── privacy/
        │   ├── en.md
        │   ├── fr-CH.md
        │   ├── de-CH.md
        │   └── it-CH.md
        │
        ├── terms/
        │   ├── en.md
        │   ├── fr-CH.md
        │   ├── de-CH.md
        │   └── it-CH.md
        │
        └── cookies/
            ├── en.md
            ├── fr-CH.md
            ├── de-CH.md
            └── it-CH.md
```

**Legal Document Component:**

```typescript
// src/pages/PrivacyPolicy.tsx
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function PrivacyPolicy() {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<string>('');
  
  useEffect(() => {
    // Load markdown content based on current language
    const lang = i18n.language;
    import(`/public/legal/privacy/${lang}.md`)
      .then(module => fetch(module.default))
      .then(response => response.text())
      .then(text => setContent(text))
      .catch(() => {
        // Fallback to English
        import(`/public/legal/privacy/en.md`)
          .then(module => fetch(module.default))
          .then(response => response.text())
          .then(text => setContent(text));
      });
  }, [i18n.language]);
  
  return (
    <div className="container mx-auto p-8">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
```

**Translation Requirements:**

- **Legal documents must be translated by certified translators**
- **Legal review required** for each language version
- **Version control** for legal document updates
- **Acceptance tracking** (user must accept terms in their language)

### 8.3 Support Content

| Content Type | Location | Languages |
|:-------------|:---------|:----------|
| **FAQs** | `/help/faq` | FR, DE, IT, EN |
| **Knowledge Base** | `/help/kb` | FR, DE, IT, EN |
| **Error Messages** | API responses | FR, DE, IT, EN |
| **Help Text** | In-app tooltips | FR, DE, IT, EN |

### 8.4 Marketing Content

| Content Type | Location | Languages |
|:-------------|:---------|:----------|
| **App Store Description (iOS)** | App Store Connect | FR, DE, IT, EN |
| **Play Store Description (Android)** | Google Play Console | FR, DE, IT, EN |
| **Screenshots** | App stores | Localized screenshots |
| **Marketing Website** | Landing page | FR, DE, IT, EN |

---

## 9. Testing Strategy

### 9.1 Pseudo-Localization

**Purpose:** Test UI layout with longer text strings (simulate German) and special characters.

**Pseudo-Localization Tool:**

```typescript
// scripts/pseudo-localize.ts
function pseudoLocalize(text: string): string {
  // Add brackets to show translated text
  // Expand text by 30% (simulate German word length)
  // Add diacritics to test font rendering
  
  const expanded = text.replace(/\w+/g, (word) => {
    // Expand each word by 30%
    const expansion = Math.ceil(word.length * 0.3);
    return word + 'x'.repeat(expansion);
  });
  
  return `[${expanded}]`;
}
```

**Usage:**

```typescript
// i18next config (development only)
if (import.meta.env.DEV && import.meta.env.VITE_PSEUDO_LOCALE === 'true') {
  i18n.on('languageChanged', (lng) => {
    if (lng === 'pseudo') {
      // Apply pseudo-localization to all strings
      i18n.services.interpolator.interpolate = (str, options) => {
        return pseudoLocalize(str);
      };
    }
  });
}
```

### 9.2 Character Length Testing

**German Text Expansion:**

| English | German | Length Increase |
|:--------|:-------|:----------------|
| "Settings" | "Einstellungen" | +38% |
| "Device" | "Gerät" | Similar |
| "Medication" | "Medikament" | +11% |
| "Notification" | "Benachrichtigung" | +50% |

**UI Testing Checklist:**

- [ ] Buttons accommodate longer German text
- [ ] Navigation menu items fit without wrapping
- [ ] Table columns wide enough for translated headers
- [ ] Modal dialogs fit translated content
- [ ] Mobile app screens fit translated text
- [ ] Device firmware display fits longest strings

**Automated Length Check:**

```typescript
// scripts/check-text-length.ts
function checkTextLength(english: string, german: string): void {
  const ratio = german.length / english.length;
  if (ratio > 1.5) {
    console.warn(`Text expansion > 50%: "${english}" → "${german}" (${ratio.toFixed(2)}x)`);
  }
}
```

### 9.3 Screenshot Testing Per Language

**Tool:** Playwright / Cypress visual regression testing

**Test Scenarios:**

1. **Login Page** — All languages
2. **Dashboard** — All languages
3. **Device List** — All languages
4. **Schedule Creation** — All languages
5. **Settings Page** — All languages

**Screenshot Comparison:**

```typescript
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

const languages = ['en', 'fr-CH', 'de-CH', 'it-CH'];

languages.forEach((lang) => {
  test(`Dashboard - ${lang}`, async ({ page }) => {
    await page.goto(`/?lang=${lang}`);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot(`dashboard-${lang}.png`, {
      fullPage: true,
    });
  });
});
```

### 9.4 RTL Testing

**Not Applicable:** All supported languages are LTR.

**Future-Proofing:**

If RTL languages are added in the future:

- Use CSS logical properties (`margin-inline-start` instead of `margin-left`)
- Test layout mirroring
- Test text alignment
- Test icon positioning

---

## 10. Implementation Checklist

### 10.1 Web Portal

- [ ] Install react-i18next and dependencies
- [ ] Configure i18next with language detection
- [ ] Create translation JSON files for all namespaces
- [ ] Implement language switcher component
- [ ] Add date/time formatting hooks
- [ ] Add number/currency formatting hooks
- [ ] Update all components to use `useTranslation`
- [ ] Test language switching
- [ ] Test date/time formatting
- [ ] Test number formatting (Swiss conventions)
- [ ] Add legal document pages (privacy, terms, cookies)
- [ ] Implement legal document language routing

### 10.2 Mobile App

- [ ] Install react-i18next and expo-localization
- [ ] Configure i18next with system locale detection
- [ ] Create translation JSON files
- [ ] Implement language switcher
- [ ] Add date-fns locale support
- [ ] Update all screens to use translations
- [ ] Test on iOS and Android
- [ ] Test language persistence (AsyncStorage)

### 10.3 Backend

- [ ] Configure RequestLocalizationOptions
- [ ] Create resource files (.resx) for all languages
- [ ] Implement Accept-Language header processing
- [ ] Localize error messages
- [ ] Localize email templates
- [ ] Localize notification messages
- [ ] Add user language preference field to database
- [ ] Implement language preference API endpoint
- [ ] Test API responses in all languages

### 10.4 Device Firmware

- [ ] Configure LVGL fonts (Montserrat 24px, 32px)
- [ ] Generate fonts with Latin Extended character set
- [ ] Create string arrays for all languages
- [ ] Implement `get_string()` function
- [ ] Record audio prompts in all languages
- [ ] Implement audio playback with language selection
- [ ] Add language setting to device settings
- [ ] Implement language sync from mobile app
- [ ] Test UI display in all languages
- [ ] Test audio prompts in all languages

### 10.5 Translation Management

- [ ] Set up translation tool (Crowdin/Lokalise)
- [ ] Export initial English strings
- [ ] Send to translators
- [ ] Review translations
- [ ] Import translated files
- [ ] Set up translation coverage tracking
- [ ] Create translation workflow documentation

### 10.6 Testing

- [ ] Set up pseudo-localization
- [ ] Test character length (German expansion)
- [ ] Set up screenshot testing
- [ ] Test all pages in all languages
- [ ] Test date/time formatting
- [ ] Test number formatting
- [ ] Test currency formatting
- [ ] Test timezone handling

---

## 11. Appendix

### 11.1 Translation Key Reference

**Common Keys (common.json):**

```json
{
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.confirm": "Confirm",
  "common.edit": "Edit",
  "common.add": "Add",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.warning": "Warning",
  "common.info": "Info",
  "common.close": "Close",
  "common.back": "Back",
  "common.next": "Next",
  "common.previous": "Previous",
  "common.yes": "Yes",
  "common.no": "No"
}
```

### 11.2 Language Codes Reference

| Language | Locale Code | ISO 639-1 | Region Code |
|:---------|:------------|:----------|:------------|
| English | `en` | en | (none) |
| French (Switzerland) | `fr-CH` | fr | CH |
| German (Switzerland) | `de-CH` | de | CH |
| Italian (Switzerland) | `it-CH` | it | CH |

### 11.3 Date/Time Format Reference

| Format | Example | Usage |
|:-------|:--------|:------|
| `DD.MM.YYYY` | 10.02.2026 | Swiss date format |
| `HH:mm` | 14:30 | 24-hour time format |
| `DD.MM.YYYY HH:mm` | 10.02.2026 14:30 | Date and time |

### 11.4 Number Format Reference

| Format | Example | Usage |
|:-------|:--------|:------|
| `1'000.50` | 1'000.50 | Swiss number format |
| `CHF 44.99` | CHF 44.99 | Currency format |

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Author:** Smart Medication Dispenser Development Team
