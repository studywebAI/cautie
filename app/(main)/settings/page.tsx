
'use client';

import { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AppContext } from '@/contexts/app-context';
import { useDictionary } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function SettingsPage() {
  const appContext = useContext(AppContext);
  const { dictionary } = useDictionary();

  if (!appContext) {
    return <div>Loading...</div>; 
  }

  const { 
    language, setLanguage, 
    role, toggleRole, // Using toggleRole from context
    highContrast, setHighContrast,
    dyslexiaFont, setDyslexiaFont,
    reducedMotion, setReducedMotion
  } = appContext;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline">{dictionary.settings.title}</h1>
        <p className="text-muted-foreground">{dictionary.settings.description}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.settings.languageTitle}</CardTitle>
          <CardDescription>{dictionary.settings.languageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-xs">
             <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="nl">Nederlands</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.settings.accessibilityTitle}</CardTitle>
          <CardDescription>{dictionary.settings.accessibilityDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">{dictionary.settings.highContrastLabel}</Label>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dyslexia-font">{dictionary.settings.dyslexiaFontLabel}</Label>
            <Switch id="dyslexia-font" checked={dyslexiaFont} onCheckedChange={setDyslexiaFont} />
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion">{dictionary.settings.reducedMotionLabel}</Label>
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
        </CardContent>
      </Card>

      {/* Developer/Testing Card */}
      <Card className="border-destructive/50">
          <CardHeader>
              <CardTitle>Developer Testing</CardTitle>
              <CardDescription>Tools for testing and debugging application features.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-between">
                  <div>
                      <Label>Switch User Role</Label>
                      <p className="text-sm text-muted-foreground">
                          Current Role: <span className="font-semibold capitalize">{role}</span>. Switch to <span className="font-semibold capitalize">{role === 'student' ? 'teacher' : 'student'}</span>.
                      </p>
                  </div>
                  <Button variant="outline" onClick={toggleRole}>
                      <Users className="mr-2 h-4 w-4" />
                      Switch Role
                  </Button>
              </div>
          </CardContent>
      </Card>

    </div>
  );
}
