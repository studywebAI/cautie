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
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <h1 className="text-2xl font-bold mb-4">Check your email</h1>
      <p className="text-muted-foreground mb-4">
        We've sent a 6-digit code to <strong>{searchParams.email}</strong>. Please enter it below to confirm your email address.
      </p>
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action={verifyOtp}
      >
        <label className="text-md" htmlFor="token">Verification Code</label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="token"
          placeholder="123456"
          required
        />
        <button className="bg-primary text-primary-foreground py-2 px-4 rounded-md">
          Verify Email
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
