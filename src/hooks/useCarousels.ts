import { useState, useEffect } from 'react';
import { ICarousel } from '@/models/carousel';

export function useCarousels() {
  const [carousels, setCarousels] = useState<ICarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const fetchCarousels = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/carousels`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch carousels');
        const data = await res.json();
        setCarousels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCarousels();
  }, []);

  return { carousels, loading, error };
}
