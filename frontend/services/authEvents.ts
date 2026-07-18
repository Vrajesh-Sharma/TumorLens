type AuthEventListener = () => void;

const listeners: AuthEventListener[] = [];

export function addAuthFailureListener(listener: AuthEventListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function emitAuthFailure(): void {
  listeners.forEach(fn => fn());
}
