import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
  /** Duration in ms before auto-dismiss. Defaults to 3500. */
  duration?: number;
}

/**
 * A small success toast that auto-dismisses after `duration` ms.
 * Rendered at the top-right on desktop and top-centre on mobile so it
 * sits below the fixed mobile nav bar without covering page controls.
 */
export default function Toast({ message, onDismiss, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDismiss, duration);
    return () => clearTimeout(id);
  }, [onDismiss, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#198754] text-white text-sm font-medium rounded-xl shadow-lg max-w-[calc(100vw-2rem)]"
    >
      <span>✓</span>
      <span>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-2 text-white/70 hover:text-white leading-none"
      >
        ✕
      </button>
    </div>
  );
}
