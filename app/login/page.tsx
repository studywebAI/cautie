
import { createClient } from '@/lib/supabase/server'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthForm } from './auth-form'

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; type: string; email: string }
}) {
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

    return redirect('/')
  }

  const signUp = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
        if (error.message.includes('User already registered')) {
            return redirect('/login?message=Account already exists. Please sign in instead.&type=info');
        }
        return redirect(`/login?message=${error.message}`);
    }

    if (data.user && !data.session) {
        return redirect(`/auth/confirm-email?email=${encodeURIComponent(email)}`);
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
