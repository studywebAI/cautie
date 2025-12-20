'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthForm } from '@/components/auth-form';

export default function Login({
  searchParams,
}: {
  searchParams: { message: string; type: string; email: string }
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const signIn = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const code = formData.get('code') as string;

    if (code) {
      // Verify 2FA code
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) {
        let errorMessage = 'Invalid verification code';
        let errorType = 'error';

        if (error.message.includes('Token has expired')) {
          errorMessage = 'The verification code has expired. Please request a new one.';
          errorType = 'warning';
        } else if (error.message.includes('Token has been used')) {
          errorMessage = 'This verification code has already been used. Please request a new one.';
          errorType = 'warning';
        } else if (error.message.includes('Invalid token')) {
          errorMessage = 'Invalid verification code. Please check and try again.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many verification attempts. Please wait a few minutes before trying again.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        router.push(`/login?message=${encodeURIComponent(errorMessage)}&type=${errorType}&email=${encodeURIComponent(email)}`);
        setIsLoading(false);
        return;
      }

      router.push('/');
      setIsLoading(false);
    } else {
      // Sign in with password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Sign in failed';
        let errorType = 'error';

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
          errorType = 'warning';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        router.push(`/login?message=${encodeURIComponent(errorMessage)}&type=${errorType}&email=${encodeURIComponent(email)}`);
        setIsLoading(false);
        return;
      }

      router.push('/');
      setIsLoading(false);
    }
  };

  const signUp = async (formData: FormData) => {
    setIsLoading(true);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        router.push('/login?message=Account already exists. Please sign in instead.&type=info');
        setIsLoading(false);
        return;
      }
      router.push(`/login?message=${encodeURIComponent(error.message)}&email=${encodeURIComponent(email)}`);
      setIsLoading(false);
      return;
    }

    if (data.user && !data.session) {
      router.push(`/auth/confirm-email?email=${encodeURIComponent(email)}&message=Please check your email for the 6-digit verification code.`);
      setIsLoading(false);
      return;
    }

    router.push('/login?message=An unexpected error occurred. Please try again.');
    setIsLoading(false);
  };

  return (
    <AuthForm
      signIn={signIn}
      signUp={signUp}
      searchParams={searchParams}

    />
  );
}
