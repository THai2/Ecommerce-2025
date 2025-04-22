import { useState, useEffect } from 'react';

export function useCategories(limit: number = 4) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categories', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(data.slice(0, limit)); // Giới hạn số lượng
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [limit]);

  return { categories, loading, error };
}