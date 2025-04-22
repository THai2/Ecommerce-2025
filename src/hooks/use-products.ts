import { IProduct } from '@/models/product';
import { useState, useEffect } from 'react';

export function useProducts(tag: string, limit: number = 4) {
  const [products, setProducts] = useState<{ name: string; href: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?tag=${tag}&limit=${limit}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [tag, limit]);

  return { products, loading, error };
}


// Hook mới cho API POST (getProductsByTag)
export function useProductsByTag(tag: string, limit: number = 10) {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchProductsByTag = async () => {
        try {
          setLoading(true);
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tag, limit }),
            cache: 'no-store',
          });
          if (!res.ok) throw new Error('Failed to fetch products by tag');
          const data = await res.json();
          setProducts(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      };
  
      fetchProductsByTag();
    }, [tag, limit]);
  
    return { products, loading, error };
  }


  // Hook mới: Lấy một product theo slug
export function useProductBySlug(slug: string) {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?slug=${slug}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  return { product, loading, error };
}

// Hook mới: Lấy related products theo category
export function useRelatedProductsByCategory({
  category,
  productId,
  limit = 10,
  page = 1,
}: {
  category: string;
  productId: string;
  limit?: number;
  page?: number;
}) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/products?category=${category}&productId=${productId}&limit=${limit}&page=${page}`,
          { cache: 'no-store' }
        );
        if (!res.ok) throw new Error('Failed to fetch related products');
        const { data, totalPages } = await res.json();
        setProducts(data);
        setTotalPages(totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (category && productId) {
      fetchRelatedProducts();
    }
  }, [category, productId, limit, page]);

  return { products, totalPages, loading, error };
}