import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/endpoints';
import { LIMITS } from '../config/limits';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutosaveLog(stageId: number, initialSections: string[]) {
  const [sections, setSections] = useState<Record<string, string>>(() => {
    // Check local backup first
    const storageKey = `${LIMITS.STORAGE_KEYS.LOG_BACKUP_PREFIX}${stageId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // ignore
      }
    }
    const defaults: Record<string, string> = {};
    initialSections.forEach((s) => {
      defaults[s] = '';
    });
    return defaults;
  });

  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const versionRef = useRef<number>(1);
  const debounceTimerRef = useRef<any>(null);

  // Load latest from server on mount
  useEffect(() => {
    let mounted = true;
    api
      .getLog(stageId)
      .then((draft) => {
        if (!mounted) return;
        if (draft && Object.keys(draft.sections).length > 0) {
          setSections((prev) => {
            // Merge: preserve non-empty local fields if server draft is older
            const merged = { ...prev, ...draft.sections };
            return merged;
          });
          versionRef.current = draft.version;
          setStatus('saved');
          setLastSavedAt(new Date(draft.updatedAt));
        }
      })
      .catch(() => {
        // keep local storage draft
      });

    return () => {
      mounted = false;
    };
  }, [stageId]);

  const saveToServer = useCallback(
    async (data: Record<string, string>) => {
      setStatus('saving');
      try {
        const res = await api.putLog(stageId, {
          sections: data,
          version: versionRef.current
        });
        versionRef.current = res.version;
        setStatus('saved');
        setLastSavedAt(new Date());
      } catch (err) {
        setStatus('error');
      }
    },
    [stageId]
  );

  const updateSection = useCallback(
    (key: string, value: string) => {
      setSections((prev) => {
        const next = { ...prev, [key]: value };
        // Save to localStorage immediately
        localStorage.setItem(
          `${LIMITS.STORAGE_KEYS.LOG_BACKUP_PREFIX}${stageId}`,
          JSON.stringify(next)
        );

        // Schedule debounced server save
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        setStatus('idle');
        debounceTimerRef.current = setTimeout(() => {
          saveToServer(next);
        }, LIMITS.AUTOSAVE_DEBOUNCE_MS);

        return next;
      });
    },
    [saveToServer, stageId]
  );

  return {
    sections,
    updateSection,
    status,
    lastSavedAt,
    saveNow: () => saveToServer(sections)
  };
}
