"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { changeRecoveredPassword, getRecoveryLinkState, isFreshRecoverySession, validateNewPassword } from "@/lib/supabase/password-recovery";

type Status = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordForm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submittingRef = useRef(false);
  const recoveryUserId = useRef<string | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let receivedRecovery = false;
    const cleanUrl = () => window.history.replaceState(window.history.state, "", window.location.pathname);
    if (getRecoveryLinkState(window.location.href) === "invalid") {
      cleanUrl();
      setStatus("invalid");
      return;
    }

    try {
      const auth = getSupabaseClient().auth;
      // Subscribe before initialization: an ordinary signed-in session must not
      // unlock this form. Only Supabase's recovery event can do that.
      const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" && !completedRef.current) {
          recoveryUserId.current = null;
          if (mounted) setStatus("invalid");
        }
        if (!isFreshRecoverySession(event, session)) return;
        receivedRecovery = true;
        cleanUrl();
        // Supabase advises not awaiting another auth call inside this callback.
        setTimeout(() => {
          void auth.getUser().then(({ data, error: userError }) => {
            if (!mounted) return;
            if (userError || !data.user || data.user.id !== session.user.id) {
              setStatus("invalid");
              return;
            }
            recoveryUserId.current = data.user.id;
            setStatus("ready");
          }).catch(() => { if (mounted) setStatus("invalid"); });
        }, 0);
      });
      void auth.initialize().then(() => {
        // The SDK schedules PASSWORD_RECOVERY immediately after initialization.
        setTimeout(() => {
          if (mounted && !receivedRecovery) {
            cleanUrl();
            setStatus("invalid");
          }
        }, 0);
      }).catch(() => { if (mounted) setStatus("invalid"); });
      return () => { mounted = false; subscription.unsubscribe(); };
    } catch {
      cleanUrl();
      setStatus("invalid");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "ready" || submittingRef.current || !recoveryUserId.current) return;
    const validation = validateNewPassword(password, confirmation);
    if (validation) {
      setError(t(validation === "short" ? "auth.resetShort" : "auth.resetMismatch"));
      return;
    }
    submittingRef.current = true;
    setPending(true);
    setError("");
    try {
      const auth = getSupabaseClient().auth;
      const result = await changeRecoveredPassword(auth, recoveryUserId.current, password);
      if (result === "invalid") {
        setStatus("invalid");
        return;
      }
      if (result !== "success") {
        setError(t(result === "weak" ? "auth.weakPassword" : "auth.resetUpdateError"));
        return;
      }
      completedRef.current = true;
      recoveryUserId.current = null;
      setPassword("");
      setConfirmation("");
      try { await auth.signOut({ scope: "local" }); } catch { /* Password changed; do not hide success. */ }
      setStatus("success");
    } catch {
      setError(t("auth.resetUpdateError"));
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F7F2E8] px-4 py-8 text-stone-800">
      <div className="w-full max-w-md rounded-[28px] border border-blue-200 bg-white p-6 shadow-xl sm:p-8">
        <Link href="/" className="text-lg font-black tracking-tight text-stone-900">{t("brand.name")}</Link>
        <h1 className="mt-5 text-2xl font-black">{t("auth.resetTitle")}</h1>
        {status === "checking" && <p role="status" className="mt-4 text-sm">{t("auth.resetChecking")}</p>}
        {status === "invalid" && <p role="alert" className="mt-4 text-sm leading-6 text-red-700">{t("auth.resetInvalid")}</p>}
        {status === "success" && <p role="status" className="mt-4 text-sm leading-6 text-blue-900">{t("auth.resetSuccess")}</p>}
        {status === "ready" && (
          <form onSubmit={submit} aria-busy={pending} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold">{t("auth.newPassword")}
              <input autoFocus required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
            </label>
            <label className="block text-sm font-semibold">{t("auth.confirmPassword")}
              <input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={pending} className="mt-1.5 min-h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={pending} className="min-h-11 w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{pending ? t("auth.processing") : t("auth.changePassword")}</button>
          </form>
        )}
        {(status === "invalid" || status === "success") && <Link href="/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:text-blue-900">{t("auth.backToSignIn")}</Link>}
      </div>
    </main>
  );
}
