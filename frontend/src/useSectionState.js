import { useState, useCallback } from 'react';

const STORAGE_KEY = 'nexusai_section_state';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Returns [isOpen, toggle] for a named collapsible section.
 * State is persisted to localStorage so it survives page reloads.
 *
 * @param {string} key       - Unique section identifier
 * @param {boolean} defaultOpen - Initial state if no saved value
 */
export function useSectionState(key, defaultOpen = true) {
  const [allState, setAllState] = useState(load);

  const isOpen = key in allState ? allState[key] : defaultOpen;

  const toggle = useCallback(() => {
    setAllState(prev => {
      const next = { ...prev, [key]: !( key in prev ? prev[key] : defaultOpen ) };
      save(next);
      return next;
    });
  }, [key, defaultOpen]);

  return [isOpen, toggle];
}
