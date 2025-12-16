import { createClient } from '@/lib/supabase/server'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; type: string; email: string }
}) {
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const code = formData.get('code') as string
    const supabase = await createClient(cookies())

    if (code) {
      // Verify 2FA code
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })

      if (error) {
        let errorMessage = 'Invalid verification code'
        let errorType = 'error'

        if (error.message.includes('Token has expired')) {
          errorMessage = 'The verification code has expired. Please request a new one.'
          errorType = 'warning'
        } else if (error.message.includes('Token has been used')) {
          errorMessage = 'This verification code has already been used. Please request a new one.'
          errorType = 'warning'
        } else if (error.message.includes('Invalid token')) {
          errorMessage = 'Invalid verification code. Please check and try again.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many verification attempts. Please wait a few minutes before trying again.'
        } else if (error.message) {
          errorMessage = error.message
        }

        return redirect(`/login?message=${encodeURIComponent(errorMessage)}&type=${errorType}&email=${encodeURIComponent(email)}`)
      }

      return redirect('/')
    } else {
      // Sign in with password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        let errorMessage = 'Sign in failed'
        let errorType = 'error'

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.'
          errorType = 'warning'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.'
        } else if (error.message) {
          errorMessage = error.message
        }

        return redirect(`/login?message=${encodeURIComponent(errorMessage)}&type=${errorType}&email=${encodeURIComponent(email)}`)
      }

      return redirect('/')
    }
  }

  const signUp = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient(cookies())

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        return redirect('/login?message=Account already exists. Please sign in instead.&type=info');
      }
      return redirect(`/login?message=${error.message}&email=${encodeURIComponent(email)}`);
    }

    if (data.user && !data.session) {
      return redirect(`/auth/confirm-email?email=${encodeURIComponent(email)}&message=Please check your email for the 6-digit verification code.`);
    }

    return redirect('/login?message=An unexpected error occurred. Please try again.');
  }

  return (
    <AuthForm
      signIn={signIn}
      signUp={signUp}
      searchParams={searchParams}
    />
  )
}
