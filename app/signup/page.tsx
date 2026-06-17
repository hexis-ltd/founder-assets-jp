import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "サインアップ | Founder Assets JP",
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl items-center px-4 py-12 sm:px-6">
      <AuthForm mode="signup" />
    </main>
  );
}
