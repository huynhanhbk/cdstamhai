import { useEffect } from 'react';

interface StageKeyboardActions {
  onSpace?: () => void;
  onEnter?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onResetTimer?: () => void;
  onToggleFullscreen?: () => void;
  onBack?: () => void;
  onToggleSound?: () => void;
  onShowHelp?: () => void;
  disabled?: boolean;
}

export function useStageKeyboard({
  onSpace,
  onEnter,
  onNext,
  onPrev,
  onResetTimer,
  onToggleFullscreen,
  onBack,
  onToggleSound,
  onShowHelp,
  disabled = false,
}: StageKeyboardActions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onSpace?.();
      } else if (e.code === 'Enter') {
        e.preventDefault();
        onEnter?.();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNext?.();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrev?.();
      } else if (e.key === 'r' || e.key === 'R') {
        // Safe reset current question timer only, never resets competition data
        e.preventDefault();
        onResetTimer?.();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onToggleFullscreen?.();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBack?.();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onToggleSound?.();
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        onShowHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onSpace,
    onEnter,
    onNext,
    onPrev,
    onResetTimer,
    onToggleFullscreen,
    onBack,
    onToggleSound,
    onShowHelp,
    disabled,
  ]);
}
