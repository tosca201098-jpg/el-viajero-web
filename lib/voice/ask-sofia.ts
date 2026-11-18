// Lets any part of the page ask Sofía to start (for example the itinerary planner) without changing the home page markup.
// The home page listens and runs its own microphone flow, so login, quotas and consent stay in one place.
const EVENT = 'destinauta:ask-sofia';
type AskDetail = { handled: boolean };

/** Returns true when the page that owns the microphone took the request. */
export function askSofia(): boolean {
  if (typeof window === 'undefined') return false;
  const detail: AskDetail = { handled: false };
  window.dispatchEvent(new CustomEvent<AskDetail>(EVENT, { detail }));
  return detail.handled;
}

/** Registers the microphone owner. Returns the function that removes it. */
export function listenAskSofia(start: () => void): () => void {
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<AskDetail>).detail;
    if (detail) detail.handled = true;
    start();
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
