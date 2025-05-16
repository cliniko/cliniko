import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Default language and fallback
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr'];
type SupportedLanguage = 'en' | 'es' | 'fr';

// Basic translation dictionaries
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Common UI elements
    'app.name': 'Cliniko Health',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.patients': 'Patients',
    'nav.consults': 'Consultations',
    'nav.appointments': 'Appointments',
    'nav.aiNotes': 'AI Notes',
    'nav.users': 'Users',
    'nav.signOut': 'Sign Out',
    
    // User roles
    'role.admin': 'Administrator',
    'role.doctor': 'Doctor',
    'role.nurse': 'Nurse',
    'role.staff': 'Staff',
    
    // Patients
    'patients.list': 'Patient Records',
    'patients.add': 'Register New Patient',
    'patients.view': 'View Patient Details',
    'patients.edit': 'Edit Patient',
    
    // Authentication
    'auth.login': 'Sign In',
    'auth.register': 'Sign Up',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.email': 'Email',
    'auth.password': 'Password',
  },
  es: {
    // Spanish translations
    'app.name': 'Cliniko Salud',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.retry': 'Intentar de nuevo',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.search': 'Buscar',
    'common.noResults': 'No se encontraron resultados',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.patients': 'Pacientes',
    'nav.consults': 'Consultas',
    'nav.appointments': 'Citas',
    'nav.aiNotes': 'Notas IA',
    'nav.users': 'Usuarios',
    'nav.signOut': 'Cerrar sesión',
    
    // User roles
    'role.admin': 'Administrador',
    'role.doctor': 'Médico',
    'role.nurse': 'Enfermera',
    'role.staff': 'Personal',
    
    // Patients
    'patients.list': 'Registros de Pacientes',
    'patients.add': 'Registrar Nuevo Paciente',
    'patients.view': 'Ver Detalles del Paciente',
    'patients.edit': 'Editar Paciente',
    
    // Authentication
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.forgotPassword': '¿Olvidó su contraseña?',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
  },
  fr: {
    // French translations
    'app.name': 'Cliniko Santé',
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.retry': 'Réessayer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.search': 'Rechercher',
    'common.noResults': 'Aucun résultat trouvé',
    
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.patients': 'Patients',
    'nav.consults': 'Consultations',
    'nav.appointments': 'Rendez-vous',
    'nav.aiNotes': 'Notes IA',
    'nav.users': 'Utilisateurs',
    'nav.signOut': 'Déconnexion',
    
    // User roles
    'role.admin': 'Administrateur',
    'role.doctor': 'Médecin',
    'role.nurse': 'Infirmier/ère',
    'role.staff': 'Personnel',
    
    // Patients
    'patients.list': 'Dossiers des patients',
    'patients.add': 'Enregistrer un nouveau patient',
    'patients.view': 'Voir les détails du patient',
    'patients.edit': 'Modifier le patient',
    
    // Authentication
    'auth.login': 'Connexion',
    'auth.register': 'S\'inscrire',
    'auth.forgotPassword': 'Mot de passe oublié?',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
  }
};

// Context interface
interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string>) => string;
  getDirection: () => 'ltr' | 'rtl';
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider props
interface I18nProviderProps {
  children: ReactNode;
  initialLanguage?: SupportedLanguage;
}

// Provider component
export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  initialLanguage 
}) => {
  // Try to get language from localStorage or navigator
  const getBrowserLanguage = (): SupportedLanguage => {
    const storedLang = localStorage.getItem('language') as SupportedLanguage;
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
      return storedLang;
    }
    
    const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }
    
    return DEFAULT_LANGUAGE;
  };

  const [language, setLanguageState] = useState<SupportedLanguage>(
    initialLanguage || getBrowserLanguage()
  );

  // Set language and save to localStorage
  const setLanguage = (lang: SupportedLanguage) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
    }
  };

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const translation = translations[language][key] || translations[DEFAULT_LANGUAGE][key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (acc, [param, value]) => acc.replace(`{{${param}}}`, value),
        translation
      );
    }
    
    return translation;
  };

  // Get text direction
  const getDirection = (): 'ltr' | 'rtl' => {
    // Add RTL languages here when supported
    const rtlLanguages: SupportedLanguage[] = [];
    return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
  };

  // Set document language on mount and when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = getDirection();
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    getDirection,
    supportedLanguages: SUPPORTED_LANGUAGES
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// Hook for using translations
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// HOC to connect component to i18n
export function withI18n<P extends object>(
  Component: React.ComponentType<P & { t: I18nContextType['t'] }>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithI18n = (props: P) => {
    const { t } = useI18n();
    return <Component {...props} t={t} />;
  };
  
  ComponentWithI18n.displayName = `withI18n(${displayName})`;
  return ComponentWithI18n;
} 