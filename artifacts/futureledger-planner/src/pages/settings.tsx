import { useState } from 'react';
import { Bell, Database, Download, Globe2, Languages, Moon, Palette, ShieldCheck, Sun, Trash2 } from 'lucide-react';
import { Button } from '@workspace/futureledger/components/ui/button';
import { Card, CardContent } from '@workspace/futureledger/components/ui/card';
import { Label } from '@workspace/futureledger/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/futureledger/components/ui/select';
import { Switch } from '@workspace/futureledger/components/ui/switch';
import { toast } from '@workspace/futureledger/hooks/use-toast';
import { languageNames, type Language, type Theme, useAppSettings } from '@/app-settings';
import { BrandMark } from '@/components/brand-mark';

type SettingsSection = 'language' | 'notifications' | 'appearance' | 'privacy';

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = useAppSettings();
  const [section, setSection] = useState<SettingsSection>('language');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    'Notification' in window ? Notification.permission : 'unsupported',
  );

  async function enableNotifications(enabled: boolean) {
    if (!enabled) {
      toast({ title: 'Notifications remain available', description: 'You can manage browser permission from your browser settings.' });
      return;
    }
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    const result = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
    setNotificationPermission(result);
    toast({ title: result === 'granted' ? 'Notifications enabled' : 'Permission not granted', description: result === 'granted' ? 'Future Ledger can show reminders while the app is open.' : 'Allow notifications in your browser settings to use reminders.' });
  }

  function exportData() {
    const data = {
      exportedAt: new Date().toISOString(),
      expenses: JSON.parse(localStorage.getItem('futureledger-planner-expenses') ?? '[]'),
      settings: JSON.parse(localStorage.getItem('futureledger:settings:v1') ?? '{}'),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `future-ledger-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Data exported', description: 'Your local planner data was downloaded as a JSON file.' });
  }

  function clearLocalData() {
    if (!window.confirm('Clear all Future Ledger expenses and local settings from this browser?')) return;
    localStorage.removeItem('futureledger-planner-expenses');
    localStorage.removeItem('futureledger-planner-deliveries');
    localStorage.removeItem('futureledger:settings:v1');
    window.location.reload();
  }

  const sections: { id: SettingsSection; icon: typeof Languages; label: string }[] = [
    { id: 'language', icon: Languages, label: t.language },
    { id: 'notifications', icon: Bell, label: t.notifications },
    { id: 'appearance', icon: Palette, label: t.appearance },
    { id: 'privacy', icon: ShieldCheck, label: t.dataPrivacy },
  ];

  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="mb-8"><div className="flex items-center gap-2 text-sm font-medium text-primary"><BrandMark className="h-5 w-5" /><span>FUTURE LEDGER</span></div><h1 className="mt-2 text-3xl font-semibold tracking-tight">{t.settingsTitle}</h1><p className="mt-2 text-muted-foreground">{t.settingsSub}</p></div>
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <Card className="h-fit"><CardContent className="space-y-2 p-3">{sections.map(({ id, icon: Icon, label }) => <button key={id} type="button" onClick={() => setSection(id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium ${section === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon className="h-4 w-4" />{label}</button>)}</CardContent></Card>
      <Card><CardContent className="p-6">
        {section === 'language' && <><div className="mb-6 flex items-start gap-4"><div className="rounded-full bg-primary/10 p-3 text-primary"><Globe2 className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold">{t.language}</h2><p className="mt-1 text-sm text-muted-foreground">{t.languageHelp}</p></div></div><div className="max-w-md space-y-2"><Label htmlFor="language">{t.language}</Label><Select value={language} onValueChange={(value) => setLanguage(value as Language)}><SelectTrigger id="language" data-testid="select-language"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(languageNames).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}</SelectContent></Select></div><div className="mt-8 rounded-lg border bg-muted/40 p-4"><div className="flex gap-3"><Database className="mt-0.5 h-4 w-4 text-muted-foreground" /><p className="text-sm text-muted-foreground">Your language preference is saved on this device. Arabic automatically switches the app shell to right-to-left layout.</p></div></div></>}
        {section === 'notifications' && <><div className="mb-6 flex items-start gap-4"><div className="rounded-full bg-primary/10 p-3 text-primary"><Bell className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold">{t.notifications}</h2><p className="mt-1 text-sm text-muted-foreground">Control browser reminders for upcoming expenses.</p></div></div><div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">Browser reminders</p><p className="mt-1 text-sm text-muted-foreground">Reminders appear while Future Ledger is open.</p></div><Switch checked={notificationPermission === 'granted'} onCheckedChange={enableNotifications} aria-label="Enable browser reminders" /></div><p className="mt-4 text-sm text-muted-foreground">Status: {notificationPermission === 'unsupported' ? 'Not supported by this browser' : notificationPermission === 'denied' ? 'Blocked in browser settings' : notificationPermission === 'granted' ? 'Enabled' : 'Not enabled'}</p></>}
        {section === 'appearance' && <><div className="mb-6 flex items-start gap-4"><div className="rounded-full bg-primary/10 p-3 text-primary"><Palette className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold">{t.appearance}</h2><p className="mt-1 text-sm text-muted-foreground">Choose the visual mode for your planner.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light' as Theme)}><Sun className="mr-2 h-4 w-4" /> Light</Button><Button type="button" variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark' as Theme)}><Moon className="mr-2 h-4 w-4" /> Dark</Button></div></>}
        {section === 'privacy' && <><div className="mb-6 flex items-start gap-4"><div className="rounded-full bg-primary/10 p-3 text-primary"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="text-xl font-semibold">{t.dataPrivacy}</h2><p className="mt-1 text-sm text-muted-foreground">Your planner is stored locally in this browser.</p></div></div><div className="space-y-3"><Button type="button" variant="outline" onClick={exportData}><Download className="mr-2 h-4 w-4" /> Export local data</Button><div className="rounded-lg border border-destructive/30 p-4"><p className="font-medium">Clear local data</p><p className="mt-1 text-sm text-muted-foreground">Remove expenses, reminder history, and settings from this browser.</p><Button className="mt-4" type="button" variant="destructive" onClick={clearLocalData}><Trash2 className="mr-2 h-4 w-4" /> Clear data</Button></div></div></>}
      </CardContent></Card>
    </div>
  </main>;
}
