// Authored preview for AuthForm — composition only (real shipped component).
// Usage ported from app/signin/page.tsx and app/signup/page.tsx.
import { AuthForm } from "founder-assets-jp";

/** サインイン画面：Google ボタン＋メール/パスワード。下部にサインアップへの導線 */
export function SignIn() {
  return <AuthForm mode="signin" />;
}

/** サインアップ画面：CTA と補足文がアカウント作成向けに切り替わる */
export function SignUp() {
  return <AuthForm mode="signup" />;
}

/** エラー表示：initialErrorMessage を渡すと赤いアラートが出る（OAuth 失敗時など） */
export function WithError() {
  return (
    <AuthForm
      mode="signin"
      initialErrorMessage="メールアドレスまたはパスワードが正しくありません。"
    />
  );
}
