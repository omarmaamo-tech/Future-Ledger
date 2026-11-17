import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'es' | 'zh' | 'vi' | 'ko' | 'ar';
export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'futureledger:settings:v1';

const labels = {
  en: { home:'Home', yearEnd:'Year-End Overview', bank:'Bank Accounts', settings:'Settings', help:'Help', language:'Language', settingsTitle:'Settings', settingsSub:'Customize your experience and privacy preferences.', general:'General', languageHelp:'Choose the language used throughout Future Ledger.', bankTitle:'Bank Accounts', bankSub:'Link a bank account to bring transactions and recurring bills into your planner.', connect:'Link a bank account', secure:'Secure connection', readOnly:'Read-only access', private:'Your data stays private', noAccounts:'No bank accounts connected yet', noAccountsSub:'Connect an account to start importing transactions. Future Ledger never stores your bank password.', providerNeeded:'Bank linking is ready for a provider such as Plaid. Add provider keys on the server to enable live connections.', appearance:'Appearance', notifications:'Notifications', dataPrivacy:'Data & Privacy' },
  es: { home:'Inicio', yearEnd:'Resumen anual', bank:'Cuentas bancarias', settings:'Configuración', help:'Ayuda', language:'Idioma', settingsTitle:'Configuración', settingsSub:'Personaliza tu experiencia y preferencias de privacidad.', general:'General', languageHelp:'Elige el idioma de Future Ledger.', bankTitle:'Cuentas bancarias', bankSub:'Conecta una cuenta bancaria para incorporar transacciones y pagos recurrentes.', connect:'Vincular una cuenta bancaria', secure:'Conexión segura', readOnly:'Acceso de solo lectura', private:'Tus datos permanecen privados', noAccounts:'Aún no hay cuentas conectadas', noAccountsSub:'Conecta una cuenta para comenzar a importar transacciones.', providerNeeded:'La interfaz está lista para un proveedor como Plaid. Añade las claves del proveedor en el servidor para activar conexiones reales.', appearance:'Apariencia', notifications:'Notificaciones', dataPrivacy:'Datos y privacidad' },
  zh: { home:'首页', yearEnd:'年度概览', bank:'银行账户', settings:'设置', help:'帮助', language:'语言', settingsTitle:'设置', settingsSub:'自定义体验和隐私偏好。', general:'常规', languageHelp:'选择 Future Ledger 使用的语言。', bankTitle:'银行账户', bankSub:'连接银行账户以导入交易和定期账单。', connect:'连接银行账户', secure:'安全连接', readOnly:'只读访问', private:'您的数据保持私密', noAccounts:'尚未连接银行账户', noAccountsSub:'连接账户后即可开始导入交易。', providerNeeded:'银行连接界面已准备好接入 Plaid 等服务。请在服务器添加服务密钥以启用真实连接。', appearance:'外观', notifications:'通知', dataPrivacy:'数据与隐私' },
  vi: { home:'Trang chủ', yearEnd:'Tổng quan cuối năm', bank:'Tài khoản ngân hàng', settings:'Cài đặt', help:'Trợ giúp', language:'Ngôn ngữ', settingsTitle:'Cài đặt', settingsSub:'Tùy chỉnh trải nghiệm và quyền riêng tư.', general:'Chung', languageHelp:'Chọn ngôn ngữ dùng trong Future Ledger.', bankTitle:'Tài khoản ngân hàng', bankSub:'Liên kết ngân hàng để đưa giao dịch và hóa đơn định kỳ vào kế hoạch.', connect:'Liên kết tài khoản ngân hàng', secure:'Kết nối an toàn', readOnly:'Quyền chỉ đọc', private:'Dữ liệu của bạn luôn riêng tư', noAccounts:'Chưa có tài khoản ngân hàng nào được kết nối', noAccountsSub:'Kết nối tài khoản để bắt đầu nhập giao dịch.', providerNeeded:'Giao diện đã sẵn sàng cho nhà cung cấp như Plaid. Thêm khóa nhà cung cấp trên máy chủ để bật kết nối thật.', appearance:'Giao diện', notifications:'Thông báo', dataPrivacy:'Dữ liệu & Quyền riêng tư' },
  ko: { home:'홈', yearEnd:'연말 개요', bank:'은행 계좌', settings:'설정', help:'도움말', language:'언어', settingsTitle:'설정', settingsSub:'환경과 개인정보 설정을 맞춤화하세요.', general:'일반', languageHelp:'Future Ledger에서 사용할 언어를 선택하세요.', bankTitle:'은행 계좌', bankSub:'은행 계좌를 연결해 거래와 반복 청구를 플래너로 가져오세요.', connect:'은행 계좌 연결', secure:'보안 연결', readOnly:'읽기 전용 접근', private:'데이터는 비공개로 유지됩니다', noAccounts:'연결된 은행 계좌가 없습니다', noAccountsSub:'계좌를 연결하면 거래 가져오기를 시작할 수 있습니다.', providerNeeded:'Plaid 같은 공급자와 연결할 준비가 되어 있습니다. 실제 연결을 사용하려면 서버에 공급자 키를 추가하세요.', appearance:'화면', notifications:'알림', dataPrivacy:'데이터 및 개인정보' },
  ar: { home:'الرئيسية', yearEnd:'نظرة عامة على السنة', bank:'الحسابات البنكية', settings:'الإعدادات', help:'المساعدة', language:'اللغة', settingsTitle:'الإعدادات', settingsSub:'خصص تجربتك وتفضيلات الخصوصية.', general:'عام', languageHelp:'اختر اللغة المستخدمة في دفتر المستقبل.', bankTitle:'الحسابات البنكية', bankSub:'اربط حسابك البنكي لإضافة المعاملات والفواتير المتكررة إلى مخططك.', connect:'ربط حساب بنكي', secure:'اتصال آمن', readOnly:'صلاحية للقراءة فقط', private:'تبقى بياناتك خاصة', noAccounts:'لا توجد حسابات بنكية مرتبطة بعد', noAccountsSub:'اربط حسابًا لبدء استيراد المعاملات. لا نخزن كلمة مرور البنك.', providerNeeded:'واجهة الربط جاهزة لمزود مثل Plaid. أضف مفاتيح المزود على الخادم لتفعيل الربط الحقيقي.', appearance:'المظهر', notifications:'الإشعارات', dataPrivacy:'البيانات والخصوصية' },
} as const;

type SettingsContextValue = { language: Language; setLanguage: (language: Language) => void; theme: Theme; setTheme: (theme: Theme) => void; t: typeof labels.en; dir: 'ltr'|'rtl' };
const SettingsContext = createContext<SettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return (JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').language as Language) || 'en'; } catch { return 'en'; }
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    try { return (JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}').theme as Theme) || 'light'; } catch { return 'light'; }
  });
  const setLanguage = (next: Language) => { setLanguageState(next); const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, language: next })); };
  const setTheme = (next: Theme) => { setThemeState(next); const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, theme: next })); };
  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = dir; }, [language, dir]);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  const value = useMemo(() => ({ language, setLanguage, theme, setTheme, t: labels[language] as typeof labels.en, dir }), [language, theme, dir]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
export function useAppSettings() { const value = useContext(SettingsContext); if (!value) throw new Error('useAppSettings must be used inside AppSettingsProvider'); return value; }
export const languageNames: Record<Language,string> = { en:'English', es:'Español (Spanish)', zh:'中文 (Chinese)', vi:'Tiếng Việt (Vietnamese)', ko:'한국어 (Korean)', ar:'العربية (Arabic)' };
