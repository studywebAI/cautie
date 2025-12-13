'use client';

import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppContext, AppContextType } from '@/contexts/app-context';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const {
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    dyslexiaFont,
    setDyslexiaFont,
    reducedMotion,
    setReducedMotion,
    theme,
    setTheme,
    role,
    setRole
  } = useContext(AppContext) as AppContextType;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Configure your application preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-[280px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="nl">Nederlands (Dutch)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Developer Settings</CardTitle>
          <CardDescription>
            Temporary settings for development purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="role-switch">Toggle Role (Dev Only)</Label>
              <p className='text-sm text-muted-foreground'>
                Switch between student and teacher view. This is for development and will be removed.
              </p>
            </div>
            <Switch
              id="role-switch"
              checked={role === 'teacher'}
              onCheckedChange={(checked) => setRole(checked ? 'teacher' : 'student')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>
                Customize the appearance and behavior of the app to suit your needs.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="high-contrast">High-Contrast Mode</Label>
                    <p className='text-sm text-muted-foreground'>Increase text and background contrast.</p>
                </div>
                <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
            <Separator />
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
                    <p className='text-sm text-muted-foreground'>Use a font designed for easier reading.</p>
                </div>
                <Switch id="dyslexia-font" checked={dyslexiaFont} onCheckedChange={setDyslexiaFont} />
            </div>
            <Separator />
             <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="reduced-motion">Reduce Animations</Label>
                    <p className='text-sm text-muted-foreground'>Turn off decorative animations and transitions.</p>
                </div>
                <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalization</CardTitle>
          <CardDescription>
            Customize the appearance and colors of your app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme" className="w-[280px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="pastel">Pastel</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-sm text-muted-foreground'>Choose your preferred color scheme.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
