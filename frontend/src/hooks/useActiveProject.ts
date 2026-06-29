import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export function useActiveProject() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [pushedProjects, setPushedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchActive = useCallback(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/active-project`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setActiveProjectId(json.data.activeProjectId);
          if (json.data.pushedProjects) {
            setPushedProjects(json.data.pushedProjects);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [fetchActive]);

  const setActive = async (id: string | null) => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/admin/active-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectId: id })
      });
      const data = await res.json();
      if (data.success) {
        fetchActive();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { activeProjectId, pushedProjects, setActive, loading };
}
