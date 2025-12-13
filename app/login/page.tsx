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
    const code = formData.get('code') as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    if (code) {
      // Verify the OTP code
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
      // Send the OTP email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        let errorMessage = 'Failed to send verification code'
        let errorType = 'error'

        if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many requests. Please wait a few minutes before trying again.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (error.message) {
          errorMessage = error.message
        }

        return redirect(`/login?message=${encodeURIComponent(errorMessage)}&type=${errorType}&email=${encodeURIComponent(email)}`)
      }

      return redirect(`/login?message=${encodeURIComponent('Verification code sent! Check your email and enter the code below.')}&type=info&email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <AuthForm
      signIn={signIn}
      searchParams={searchParams}
    />
  )
}
