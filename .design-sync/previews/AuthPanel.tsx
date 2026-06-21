// Authored preview for AuthPanel — composition only (real shipped component).
// Usage ported from app/page.tsx header nav (<AuthPanel user={user} />).
import { AuthPanel } from "founder-assets-jp";

/** 未ログイン：サインインへのピル型リンクだけを表示 */
export function SignedOut() {
  return <AuthPanel user={null} />;
}

/** ログイン済み：メールアドレスとログアウトボタンのパネルを表示 */
export function SignedIn() {
  return <AuthPanel user={{ id: "u_1", email: "founder@example.com" }} />;
}
