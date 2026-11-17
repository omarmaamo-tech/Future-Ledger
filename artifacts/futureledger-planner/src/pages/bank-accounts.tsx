import { type ReactNode } from 'react';
import { Building2, Eye, Link2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Button } from '@workspace/futureledger/components/ui/button';
import { Card, CardContent } from '@workspace/futureledger/components/ui/card';
import { toast } from '@workspace/futureledger/hooks/use-toast';
import { useAppSettings } from '@/app-settings';
import { BrandMark } from '@/components/brand-mark';

export default function BankAccountsPage() {
  const { t } = useAppSettings();
  function connectBank() { toast({ title: 'Bank provider required', description: t.providerNeeded }); }
  return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8"><div className="flex items-center gap-2 text-sm font-medium text-primary"><BrandMark className="h-5 w-5" /><span>FUTURE LEDGER</span></div><h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.bankTitle}</h1><p className="mt-2 max-w-2xl text-muted-foreground">{t.bankSub}</p></div>
    <Card className="mb-6 overflow-hidden border-primary/20"><CardContent className="grid gap-8 p-6 md:grid-cols-[1.25fr_.75fr] md:p-8">
      <div><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-6 w-6"/></div><h2 className="text-2xl font-semibold">{t.connect}</h2><p className="mt-2 max-w-xl text-muted-foreground">{t.bankSub}</p><Button className="mt-6" onClick={connectBank} data-testid="button-connect-bank"><Link2 className="mr-2 h-4 w-4"/>{t.connect}</Button></div>
      <div className="space-y-3 rounded-xl bg-muted/50 p-5"><Feature icon={<ShieldCheck className="h-4 w-4"/>} title={t.secure}/><Feature icon={<Eye className="h-4 w-4"/>} title={t.readOnly}/><Feature icon={<LockKeyhole className="h-4 w-4"/>} title={t.private}/></div>
    </CardContent></Card>
    <Card><CardContent className="flex flex-col items-center px-6 py-14 text-center"><BrandMark className="mb-4 h-12 w-12"/><h2 className="text-xl font-semibold">{t.noAccounts}</h2><p className="mt-2 max-w-lg text-sm text-muted-foreground">{t.noAccountsSub}</p><p className="mt-5 max-w-xl rounded-md bg-muted px-4 py-3 text-xs text-muted-foreground">{t.providerNeeded}</p></CardContent></Card>
  </main>;
}
function Feature({ icon, title }: { icon: ReactNode; title: string }) { return <div className="flex items-center gap-3 rounded-lg bg-background p-3 text-sm font-medium"><span className="text-primary">{icon}</span>{title}</div>; }
