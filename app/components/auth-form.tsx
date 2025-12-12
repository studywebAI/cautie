
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({
  signIn,
  signUp,
  searchParams,
}: {
  signIn: (formData: FormData) => void
  signUp: (formData: FormData) => void
  searchParams: { message: string; type: string }
}) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome to StudyWeb</CardTitle>
          <CardDescription className="text-center text-base">
            Enter your email and password to sign in or create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <form className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button formAction={signIn} variant="outline">
                  Sign In
                </Button>
                <Button formAction={signUp}>Sign Up</Button>
              </div>
            </form>

            {searchParams?.message && (
              <div className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-lg">
                <p
                  className={
                    searchParams.type === 'info'
                      ? 'text-blue-500'
                      : 'text-red-500'
                  }
                >
                  {searchParams.message}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
