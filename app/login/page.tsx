import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench } from 'lucide-react';

export default async function LoginPage({ searchParams }: { searchParams: { message: string, redirect: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const redirectTo = searchParams.redirect || '/';

  if (session) {
    return redirect(redirectTo)
  }
  
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect(redirectTo)
  }

  const signUp = async (formData: FormData) => {
    'use server'

    const origin = headers().get('origin')
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error(error);
      return redirect('/login?message=Could not create user. The user may already exist or your password is too weak.')
    }

    return redirect('/login?message=Check email to continue sign in process')
  }

  return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-bold font-headline text-primary">
                StudyWeb
              </h1>
            </div>
          <Tabs defaultValue="sign-in" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in">
              <Card>
                <form>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-in">Email</Label>
                      <Input id="email-in" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-in">Password</Label>
                      <Input id="password-in" name="password" type="password" required />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <Button formAction={signIn} className="w-full">Sign In</Button>
                     {searchParams?.message && (
                      <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
                        {searchParams.message}
                      </p>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="sign-up">
              <Card>
                <form>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Enter your email and password to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-up">Email</Label>
                    <Input id="email-up" name="email" type="email" placeholder="m@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-up">Password</Label>
                    <Input id="password-up" name="password" type="password" required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button formAction={signUp} className="w-full">Sign Up</Button>
                   {searchParams?.message && (
                      <p className="text-sm text-destructive p-3 bg-destructive/10 rounded-md">
                        {searchParams.message}
                      </p>
                    )}
                </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
  )
}
