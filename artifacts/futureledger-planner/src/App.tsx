import { type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { BrandMark } from '@/components/brand-mark';
import { Building2, CalendarDays, Settings, WalletCards } from 'lucide-react';
import { Toaster } from '@workspace/futureledger/components/ui/toaster';
import { TooltipProvider } from '@workspace/futureledger/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import HomePage from '@/pages/home';
import YearEndPage from '@/pages/year-end';
import BankAccountsPage from '@/pages/bank-accounts';
import SettingsPage from '@/pages/settings';
import { AppSettingsProvider, useAppSettings } from '@/app-settings';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

function Router() {
  const { t } = useAppSettings();
  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight" data-testid="link-home"><BrandMark /><span>Future Ledger</span></Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-1">
          <NavigationLink href="/" icon={<WalletCards className="h-4 w-4" />} label={t.home}/>
          <NavigationLink href="/year-end" icon={<CalendarDays className="h-4 w-4" />} label={t.yearEnd}/>
          <NavigationLink href="/bank-accounts" icon={<Building2 className="h-4 w-4" />} label={t.bank}/>
          <NavigationLink href="/settings" icon={<Settings className="h-4 w-4" />} label={t.settings}/>
        </nav>
      </div>
    </header>
    <RoutedErrorBoundary><Switch><Route path="/" component={HomePage}/><Route path="/year-end" component={YearEndPage}/><Route path="/bank-accounts" component={BankAccountsPage}/><Route path="/settings" component={SettingsPage}/><Route component={NotFound}/></Switch></RoutedErrorBoundary>
    <footer className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-8 pt-6 text-xs text-muted-foreground sm:px-6 lg:px-8"><BrandMark className="h-5 w-5" /><span>Future Ledger · Private planning on your device.</span></footer>
  </div>;
}
function NavigationLink({ href, icon, label }: { href:string; icon:ReactNode; label:string }) { const [location] = useLocation(); const active = location === href; return <Link href={href} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} aria-current={active?'page':undefined}>{icon}{label}</Link>; }
function RoutedErrorBoundary({ children }: { children:ReactNode }) { const [location] = useLocation(); return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>; }
function App() { return <TooltipProvider><AppSettingsProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router/></WouterRouter><Toaster/></AppSettingsProvider></TooltipProvider>; }
export default App;
