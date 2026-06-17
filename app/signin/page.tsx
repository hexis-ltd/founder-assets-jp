import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "サインイン | Founder Assets JP",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/");
  const params = await searchParams;
  const errorMessage = getAuthErrorMessage(params?.error);

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl items-center px-4 py-12 sm:px-6">
      <AuthForm initialErrorMessage={errorMessage} mode="signin" />
    </main>
  );
}

function getAuthErrorMessage(error: string | string[] | undefined) {
  const value = Array.isArray(error) ? error[0] : error;
  const messages: Record<string, string> = {
    google_email_unverified: "Googleアカウントのメール確認が完了していません。",
    google_unconfigured: "Googleログインの設定が未完了です。",
    oauth_failed: "Googleログインに失敗しました。もう一度お試しください。",
    oauth_invalid: "Googleログインの応答を確認できませんでした。",
    oauth_state: "Googleログインの確認に失敗しました。もう一度お試しください。",
  };
  return value ? messages[value] : undefined;
}
