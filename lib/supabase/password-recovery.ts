export type RecoveryLinkState = "pending" | "invalid";

// Inspect only the presence and type of callback parameters. Never return tokens.
export function getRecoveryLinkState(href: string): RecoveryLinkState {
  const url = new URL(href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (url.searchParams.has("error") || url.searchParams.has("error_code") || fragment.has("error") || fragment.has("error_code")) {
    return "invalid";
  }
  if (url.searchParams.has("code")) return "pending"; // Supabase PKCE callback.
  return fragment.get("type") === "recovery" && fragment.has("access_token") && fragment.has("refresh_token")
    ? "pending" : "invalid";
}

export function validateNewPassword(password: string, confirmation: string): "short" | "mismatch" | null {
  if (password.length < 8) return "short";
  if (password !== confirmation) return "mismatch";
  return null;
}

export function isFreshRecoverySession(event: string, session: {
  user?: { id?: string };
  expires_at?: number;
} | null): session is { user: { id: string }; expires_at?: number } {
  return event === "PASSWORD_RECOVERY" && !!session?.user?.id &&
    (!session.expires_at || session.expires_at * 1000 > Date.now());
}

type PasswordAuth = {
  getUser: () => Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>;
  updateUser: (attributes: { password: string }) => Promise<{ error: { code?: string } | null }>;
};

export async function changeRecoveredPassword(
  auth: PasswordAuth, expectedUserId: string, password: string,
): Promise<"success" | "invalid" | "weak" | "error"> {
  const { data, error } = await auth.getUser();
  if (error || !data.user || data.user.id !== expectedUserId) return "invalid";
  const { error: updateError } = await auth.updateUser({ password });
  if (!updateError) return "success";
  return updateError.code === "weak_password" ? "weak" : "error";
}
