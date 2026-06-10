import { redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("onboarding_complete, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  // Admins (the Nomara team) go straight to the dashboard without the
  // member onboarding; they also never appear in the Discover deck.
  if (!profile?.onboarding_complete && !profile?.is_admin) {
    redirect("/onboarding");
  }

  return (
    <div className="texture-grain flex min-h-screen flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-8 md:pb-16">
        {children}
      </main>
    </div>
  );
}
