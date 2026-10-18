"use client";

import { useLanguage } from "./LanguageProvider";

import { FormEvent, useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { siteUrl } from "@/lib/seo";

type AuthMode = "signup" | "signin";

export default function AuthDialog({ mode, onClose }: {
  mode: AuthMode;
  onClose: () => void;
}) {
  const { t, text } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submittingRef = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const signup = mode === "signup";
  const title = forgotPassword ? t("auth.forgotTitle") : signup ? "Crear cuenta" : "Iniciar sesión";

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previousFocus?.focus();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const supabase = getSupabaseClient();
      if (forgotPassword) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${siteUrl}/auth/reset-password`,
        });
        // Do not reveal whether an address belongs to an account.
        if (resetError && resetError.code !== "user_not_found" && resetError.code !== "email_not_found") {
          setError(resetError.status === 429 ? t("auth.rateLimit") : t("auth.resetSendError"));
          return;
        }
        setMessage(t("auth.resetSent"));
        return;
      }
      const credentials = { email: email.trim(), password };
      const result = signup
        ? await supabase.auth.signUp({
            ...credentials,
            options: { emailRedirectTo: window.location.origin },
          })
        : await supabase.auth.signInWithPassword(credentials);

      if (result.error) {
        const code = result.error.code;
        if (code?.startsWith("PGRST") || result.error.status === 404) {
          setError("El acceso a cuentas tiene una ruta de Supabase incorrecta. Revisa la URL del proyecto.");
        } else if (code === "invalid_credentials") {
          setError("Correo o contraseña incorrectos.");
        } else if (code === "email_not_confirmed") {
          setError("Confirma tu correo antes de iniciar sesión.");
        } else if (code === "weak_password") {
          setError("La contraseña no cumple los requisitos de seguridad del servicio.");
        } else if (code === "user_already_exists" || code === "email_exists") {
          setError("No se ha podido crear la cuenta. Prueba a iniciar sesión.");
        } else if (result.error.status === 429 || code === "over_email_send_rate_limit") {
          setError("Demasiados intentos. Espera unos minutos y vuelve a intentarlo.");
        } else {
          setError(signup
            ? "No se ha podido crear la cuenta. Comprueba los datos e inténtalo de nuevo."
            : "No se ha podido iniciar sesión. Comprueba los datos e inténtalo de nuevo.");
        }
        return;
      }

      setPassword("");
      setMessage(signup && !result.data.session
        ? "Revisa tu correo para confirmar el registro. Si ya tienes cuenta, puedes iniciar sesión."
        : signup ? "Cuenta creada. Ya has iniciado sesión." : "Has iniciado sesión correctamente.");
    } catch (cause) {
      setError(cause instanceof Error && cause.message.startsWith("El acceso a cuentas")
        ? cause.message
        : "No se ha podido conectar con el servicio. Inténtalo de nuevo.");
    } finally {
      submittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="auth-dialog-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[28px] border border-stone-200 bg-[#F7F2E8] p-6 text-stone-800 shadow-2xl backdrop:bg-black/50 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="auth-dialog-title" className="text-2xl font-black">{text(title)}</h2>
        <button type="button" onClick={onClose} aria-label={t("common.close")} className="rounded-lg px-3 py-2 text-xl hover:bg-stone-200 focus-visible:ring-2 focus-visible:ring-blue-600">×</button>
      </div>
      {message ? (
        <div className="mt-5">
          <p role="status" className="text-sm leading-6 text-blue-900">{text(message)}</p>
          <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600">{t("common.close")}</button>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={pending} className="mt-5 space-y-4">
          <label className="block text-sm font-semibold">
            {t("auth.email")}
            <input autoFocus required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
          </label>
          {!forgotPassword && <label className="block text-sm font-semibold">
            {t("auth.password")}
            <input required type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={signup ? 6 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
          </label>}
          {error && <p role="alert" className="text-sm leading-5 text-red-700">{text(error)}</p>}
          <button type="submit" disabled={pending} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">{pending ? t("auth.processing") : forgotPassword ? t("auth.sendReset") : text(title)}</button>
          {!signup && <button type="button" disabled={pending} onClick={() => { setForgotPassword(!forgotPassword); setError(""); setMessage(""); setPassword(""); }} className="w-full rounded-xl py-2 text-sm font-semibold text-blue-700 hover:text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-600">{forgotPassword ? t("auth.backToSignIn") : t("auth.forgotPassword")}</button>}
        </form>
      )}
    </dialog>
  );
}
