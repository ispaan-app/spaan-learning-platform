// Comprehensive internationalization (i18n) system with multiple language support

export interface LocaleConfig {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  dateFormat: string
  timeFormat: string
  currency: string
  numberFormat: {
    decimal: string
    thousands: string
  }
}

export interface TranslationNamespace {
  [key: string]: string | TranslationNamespace
}

export interface TranslationData {
  [locale: string]: {
    [namespace: string]: TranslationNamespace
  }
}

export interface I18nConfig {
  defaultLocale: string
  supportedLocales: string[]
  fallbackLocale: string
  namespaces: string[]
  loadPath: string
  savePath: string
  debug: boolean
}

class I18nManager {
  private static instance: I18nManager
  private config: I18nConfig
  private translations: TranslationData = {}
  private currentLocale: string
  private localeConfigs: Map<string, LocaleConfig> = new Map()

  constructor() {
    this.config = {
      defaultLocale: 'en',
      supportedLocales: ['en', 'es', 'fr', 'de', 'zh', 'ar', 'hi', 'pt', 'ru', 'ja'],
      fallbackLocale: 'en',
      namespaces: ['common', 'auth', 'dashboard', 'forms', 'errors', 'notifications', 'admin', 'learner'],
      loadPath: '/locales',
      savePath: '/locales',
      debug: process.env.NODE_ENV === 'development'
    }
    
    this.currentLocale = this.config.defaultLocale
    this.initializeLocaleConfigs()
  }

  static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager()
    }
    return I18nManager.instance
  }

  private initializeLocaleConfigs(): void {
    const configs: LocaleConfig[] = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: 'HH:mm',
        currency: 'USD',
        numberFormat: { decimal: '.', thousands: ',' }
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        currency: 'EUR',
        numberFormat: { decimal: ',', thousands: '.' }
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        currency: 'EUR',
        numberFormat: { decimal: ',', thousands: ' ' }
      },
      {
        code: 'de',
        name: 'German',
        nativeName: 'Deutsch',
        direction: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm',
        currency: 'EUR',
        numberFormat: { decimal: ',', thousands: '.' }
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        direction: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: 'HH:mm',
        currency: 'CNY',
        numberFormat: { decimal: '.', thousands: ',' }
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        currency: 'SAR',
        numberFormat: { decimal: '.', thousands: ',' }
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        currency: 'INR',
        numberFormat: { decimal: '.', thousands: ',' }
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        direction: 'ltr',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        currency: 'BRL',
        numberFormat: { decimal: ',', thousands: '.' }
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        direction: 'ltr',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: 'HH:mm',
        currency: 'RUB',
        numberFormat: { decimal: ',', thousands: ' ' }
      },
      {
        code: 'ja',
        name: 'Japanese',
        nativeName: '日本語',
        direction: 'ltr',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: 'HH:mm',
        currency: 'JPY',
        numberFormat: { decimal: '.', thousands: ',' }
      }
    ]

    configs.forEach(config => {
      this.localeConfigs.set(config.code, config)
    })
  }

  async loadTranslations(locale: string, namespace: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.loadPath}/${locale}/${namespace}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}/${namespace}`)
      }
      
      const translations = await response.json()
      
      if (!this.translations[locale]) {
        this.translations[locale] = {}
      }
      
      this.translations[locale][namespace] = translations
      
      if (this.config.debug) {
        console.log(`Loaded translations for ${locale}/${namespace}`)
      }
    } catch (error) {
      console.error(`Error loading translations for ${locale}/${namespace}:`, error)
      
      // Fallback to default locale
      if (locale !== this.config.fallbackLocale) {
        await this.loadTranslations(this.config.fallbackLocale, namespace)
      }
    }
  }

  async loadAllTranslations(locale: string): Promise<void> {
    const promises = this.config.namespaces.map(namespace => 
      this.loadTranslations(locale, namespace)
    )
    
    await Promise.all(promises)
  }

  t(key: string, options?: {
    locale?: string
    namespace?: string
    values?: Record<string, any>
    count?: number
  }): string {
    const locale = options?.locale || this.currentLocale
    const namespace = options?.namespace || 'common'
    const values = options?.values || {}
    const count = options?.count

    let translation = this.getTranslation(locale, namespace, key)
    
    // Fallback to default locale if translation not found
    if (!translation && locale !== this.config.fallbackLocale) {
      translation = this.getTranslation(this.config.fallbackLocale, namespace, key)
    }
    
    // Fallback to key if no translation found
    if (!translation) {
      if (this.config.debug) {
        console.warn(`Translation missing for key: ${key}`)
      }
      return key
    }

    // Handle pluralization
    if (count !== undefined) {
      translation = this.handlePluralization(translation, count)
    }

    // Replace variables
    translation = this.replaceVariables(translation, values)

    return translation
  }

  private getTranslation(locale: string, namespace: string, key: string): string | null {
    const keys = key.split('.')
    let translation: any = this.translations[locale]?.[namespace]
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k]
      } else {
        return null
      }
    }
    
    return typeof translation === 'string' ? translation : null
  }

  private handlePluralization(translation: string, count: number): string {
    // Simple pluralization logic
    if (count === 0) {
      return translation.replace(/\{count\}/g, '0').replace(/s\}/g, '}')
    } else if (count === 1) {
      return translation.replace(/\{count\}/g, '1').replace(/s\}/g, '}')
    } else {
      return translation.replace(/\{count\}/g, count.toString())
    }
  }

  private replaceVariables(translation: string, values: Record<string, any>): string {
    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return values[key] !== undefined ? values[key] : match
    })
  }

  setLocale(locale: string): void {
    if (this.config.supportedLocales.includes(locale)) {
      this.currentLocale = locale
      this.updateDocumentDirection()
      this.updateDocumentLanguage()
    } else {
      console.warn(`Unsupported locale: ${locale}`)
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale
  }

  getSupportedLocales(): string[] {
    return this.config.supportedLocales
  }

  getLocaleConfig(locale: string): LocaleConfig | undefined {
    return this.localeConfigs.get(locale)
  }

  private updateDocumentDirection(): void {
    const config = this.getLocaleConfig(this.currentLocale)
    if (config) {
      document.documentElement.dir = config.direction
    }
  }

  private updateDocumentLanguage(): void {
    document.documentElement.lang = this.currentLocale
  }

  formatDate(date: Date, options?: {
    locale?: string
    format?: 'short' | 'medium' | 'long' | 'full'
  }): string {
    const locale = options?.locale || this.currentLocale
    const config = this.getLocaleConfig(locale)
    
    if (!config) return date.toLocaleDateString()

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }

    if (options?.format === 'long') {
      formatOptions.month = 'long'
    } else if (options?.format === 'full') {
      formatOptions.weekday = 'long'
      formatOptions.month = 'long'
    }

    return date.toLocaleDateString(locale, formatOptions)
  }

  formatTime(date: Date, options?: {
    locale?: string
    format?: 'short' | 'medium' | 'long'
  }): string {
    const locale = options?.locale || this.currentLocale
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    }

    if (options?.format === 'long') {
      formatOptions.second = '2-digit'
    }

    return date.toLocaleTimeString(locale, formatOptions)
  }

  formatNumber(number: number, options?: {
    locale?: string
    style?: 'decimal' | 'currency' | 'percent'
    currency?: string
  }): string {
    const locale = options?.locale || this.currentLocale
    const config = this.getLocaleConfig(locale)
    
    const formatOptions: Intl.NumberFormatOptions = {
      style: options?.style || 'decimal'
    }

    if (options?.style === 'currency') {
      formatOptions.currency = options.currency || config?.currency || 'USD'
    }

    return number.toLocaleString(locale, formatOptions)
  }

  formatCurrency(amount: number, options?: {
    locale?: string
    currency?: string
  }): string {
    const locale = options?.locale || this.currentLocale
    const config = this.getLocaleConfig(locale)
    
    return amount.toLocaleString(locale, {
      style: 'currency',
      currency: options?.currency || config?.currency || 'USD'
    })
  }

  async saveTranslations(locale: string, namespace: string, translations: TranslationNamespace): Promise<void> {
    try {
      const response = await fetch(`${this.config.savePath}/${locale}/${namespace}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(translations, null, 2)
      })

      if (!response.ok) {
        throw new Error(`Failed to save translations for ${locale}/${namespace}`)
      }

      // Update local cache
      if (!this.translations[locale]) {
        this.translations[locale] = {}
      }
      this.translations[locale][namespace] = translations

      if (this.config.debug) {
        console.log(`Saved translations for ${locale}/${namespace}`)
      }
    } catch (error) {
      console.error(`Error saving translations for ${locale}/${namespace}:`, error)
      throw error
    }
  }

  getMissingTranslations(locale: string): string[] {
    const missing: string[] = []
    const defaultTranslations = this.translations[this.config.defaultLocale]
    
    if (!defaultTranslations) return missing

    for (const namespace of this.config.namespaces) {
      const defaultNamespace = defaultTranslations[namespace]
      const localeNamespace = this.translations[locale]?.[namespace]
      
      if (defaultNamespace && !localeNamespace) {
        missing.push(`${locale}/${namespace}`)
      } else if (defaultNamespace && localeNamespace) {
        missing.push(...this.findMissingKeys(defaultNamespace, localeNamespace, `${namespace}.`))
      }
    }

    return missing
  }

  private findMissingKeys(defaultObj: any, localeObj: any, prefix: string): string[] {
    const missing: string[] = []
    
    for (const key in defaultObj) {
      const fullKey = `${prefix}${key}`
      
      if (!(key in localeObj)) {
        missing.push(fullKey)
      } else if (typeof defaultObj[key] === 'object' && typeof localeObj[key] === 'object') {
        missing.push(...this.findMissingKeys(defaultObj[key], localeObj[key], `${fullKey}.`))
      }
    }
    
    return missing
  }
}

// React hook for i18n
export function useI18n() {
  const i18n = I18nManager.getInstance()
  
  return {
    t: i18n.t.bind(i18n),
    setLocale: i18n.setLocale.bind(i18n),
    getCurrentLocale: i18n.getCurrentLocale.bind(i18n),
    getSupportedLocales: i18n.getSupportedLocales.bind(i18n),
    getLocaleConfig: i18n.getLocaleConfig.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n)
  }
}

// Language switcher component
export function LanguageSwitcher() {
  const { t, setLocale, getCurrentLocale, getSupportedLocales, getLocaleConfig } = useI18n()
  const currentLocale = getCurrentLocale()
  const supportedLocales = getSupportedLocales()

  return (
    <select
      value={currentLocale}
      onChange={(e) => setLocale(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {supportedLocales.map(locale => {
        const config = getLocaleConfig(locale)
        return (
          <option key={locale} value={locale}>
            {config?.nativeName || locale}
          </option>
        )
      })}
    </select>
  )
}

// Export singleton instance
export const i18n = I18nManager.getInstance()
