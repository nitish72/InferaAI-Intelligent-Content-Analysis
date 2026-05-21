import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const API_BASE = 'http://localhost:8000/api';

function normalizeHistoryEntry(entry) {
  const summaryPreview = entry.summary_preview ?? entry.summaryPreview ?? '';
  return {
    ...entry,
    summary_preview: summaryPreview,
    summaryPreview,
    keywords: entry.keywords ?? [],
    result: entry.result ?? {},
  };
}

export function useHistory() {
  const [history, setHistory] = useState([]);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setHistory([]);
      return;
    }

    fetch(`${API_BASE}/history`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setHistory(Array.isArray(data) ? data.map(normalizeHistoryEntry) : []))
      .catch(() => setHistory([]));
  }, [token]);

  const addEntry = async (entry) => {
    if (!token) return null;

    const optimisticId = Date.now().toString();
    const newEntry = normalizeHistoryEntry({ ...entry, id: optimisticId, timestamp: new Date().toISOString() });
    setHistory(prev => [newEntry, ...prev]);

    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(entry)
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(prev => prev.map(item => item.id === optimisticId ? { ...item, id: data.id } : item));
        setCurrentEntryId(prev => prev === optimisticId ? data.id : prev);
        return data.id;
      }
    } catch {
    }
    return optimisticId;
  };

  const removeEntry = async (id) => {
    if (!token) return;
    setHistory(prev => prev.filter(entry => entry.id !== id));
    await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const clearHistory = useCallback(async () => {
    if (!token) {
      setHistory([]);
      return;
    }

    setHistory([]);
    await fetch(`${API_BASE}/history`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }, [token]);

  const updateEntry = async (id, updates) => {
    if (!token) return;

    setHistory(prev => {
      const updatedHistory = prev.map(entry => entry.id === id ? normalizeHistoryEntry({ ...entry, ...updates }) : entry);

      if (updates.result || updates.chat) {
        const current = updatedHistory.find(entry => entry.id === id);
        if (current) {
          const updatedResult = { ...current.result, ...updates.result };
          if (updates.chat) updatedResult.chat = updates.chat;

          fetch(`${API_BASE}/history/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ result: updatedResult })
          });
        }
      }

      return updatedHistory;
    });
  };

  return { history, currentEntryId, setCurrentEntryId, addEntry, removeEntry, clearHistory, updateEntry };
}

export function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}
