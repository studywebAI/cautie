import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: { message: string, email: string };
}) {

  const verifyOtp = async (formData: FormData) => {
    'use server';

    const token = formData.get('token') as string;
    const email = searchParams.email;
    const supabase = await createClient(cookies());

    if (!email || !token) {
        return redirect(`/auth/confirm-email?email=${encodeURIComponent(email)}&message=Email and code are required.`);
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    if (error) {
      return redirect(`/auth/confirm-email?email=${encodeURIComponent(email)}&message=Invalid or expired code. Please try again.`);
    }

    // On successful verification, Supabase sets the session cookie and the user is logged in.
    return redirect('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="mx-auto max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-2">
            We've sent a verification code to <strong>{searchParams.email}</strong>. Please enter it below to confirm your email address.
          </p>
        </div>
        <form
          className="space-y-4"
          action={verifyOtp}
        >
          <div className="space-y-2">
            <label className="text-md font-medium" htmlFor="token">Verification Code</label>
            <input
              className="w-full rounded-md px-4 py-2 bg-inherit border"
              name="token"
              placeholder="Enter verification code"
              required
            />
          </div>
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md">
            Verify Email
          </button>

          {searchParams?.message && (
            <p className="p-4 bg-muted text-foreground text-center rounded-lg">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
