import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/supabase/database.types"

export const dynamic = "force-dynamic"

// GET all personal tasks for the logged-in user
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { searchParams } = new URL(request.url);
  const guestId = searchParams.get("guestId");

  if (!session && !guestId) {
    return NextResponse.json([]);
  }

  let tasks: any[] = [];
  if (session) {
    const { data, error } = await supabase
      .from("personal_tasks")
      .select()
      .eq("user_id", session.user.id as "user_id");
    if (error) {
      console.error("Error fetching personal tasks for user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    tasks = data;
  } else if (guestId) {
    const { data, error } = await supabase
      .from("personal_tasks")
      .select()
      .eq("guest_id", guestId as "guest_id");
    if (error) {
      console.error("Error fetching personal tasks for guest:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    tasks = data;
  }

  return NextResponse.json(tasks);
}

// POST a new personal task
export async function POST(request: Request) {
  const { title, description, date, subject, guestId } = await request.json();
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !guestId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insertData: Database["public"]["Tables"]["personal_tasks"]["Insert"] = {
    title,
    description,
    date,
    subject,
    user_id: user?.id || null,
    guest_id: guestId || null,
    owner_type: user ? "user" : "guest"
  };

  const { data, error } = await supabase
    .from("personal_tasks")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error("Error creating personal task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
