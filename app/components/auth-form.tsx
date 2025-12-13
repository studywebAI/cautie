'use client'

import { useState } from 'react'
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
import { Loader2 } from 'lucide-react'

export function AuthForm({
  signIn,
  searchParams,
}: {
  signIn: (formData: FormData) => void
  searchParams: { message: string; type: string; email: string }
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState(searchParams?.email || '')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      await signIn(formData)
      setStep('code')
    } catch (error) {
      console.error('Email submission failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('code', code)
      await signIn(formData)
    } catch (error) {
      console.error('Code verification failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome to cautie</CardTitle>
          <CardDescription className="text-center text-base">
            {step === 'email'
              ? 'Enter your email to receive a login code'
              : 'Enter the 6-digit code sent to your email'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send Login Code'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCodeSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button type="submit" disabled={isLoading || code.length !== 6}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('email')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                </div>
              </form>
            )}

            {searchParams?.message && (
              <div className="mt-4 p-4 bg-foreground/10 text-foreground text-center rounded-lg">
                <p
                  className={
                    searchParams.type === 'info'
                      ? 'text-blue-500'
                      : searchParams.type === 'warning'
                      ? 'text-yellow-500'
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
