import { useState, useEffect, useCallback } from 'react';
import type { Evaluation, Project, ScoreMap } from '../types';
import { CRITERIA } from '../constants/data';
import { useAuth } from '../context/AuthContext';

const API_BASE = '/api';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/projects`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProjects(json.data);
        else setError(json.message);
      })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading, error };
}

export function useEvaluations() {
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAll = useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE}/evaluations`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const map: Record<string, Evaluation> = {};
          (json.data as Evaluation[]).forEach((e) => {
            map[e.project_id] = e;
          });
          setEvaluations(map);
        } else {
          setError(json.message);
        }
      })
      .catch(() => setError('Failed to load evaluations'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveEvaluation = useCallback(
    async (projectId: string, scores: ScoreMap, comment: string): Promise<boolean> => {
      let total = 0;
      CRITERIA.forEach((c) => {
        total += parseFloat(String(scores[c.id])) || 0;
      });

      try {
        const res = await fetch(`${API_BASE}/evaluations`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            project_id: projectId,
            scores,
            comment,
            total_score: parseFloat(total.toFixed(2)),
          }),
        });
        const json = await res.json();
        if (json.success) {
          setEvaluations((prev) => ({ ...prev, [projectId]: json.data }));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [token]
  );

  return { evaluations, loading, error, saveEvaluation, refetch: fetchAll };
}
