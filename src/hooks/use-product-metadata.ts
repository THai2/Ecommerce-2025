import { useEffect } from 'react';
import { useProductBySlug } from './use-products';

export function useProductMetadata(slug: string) {
  const { product, loading, error } = useProductBySlug(slug);

  useEffect(() => {
    if (!product) return;

    // Cập nhật title động
    document.title = product.name || 'Product not found';
  }, [product]);

  return {
    product,
    loading,
    error,
    metadata: product
      ? { title: product.name, description: product.description }
      : { title: 'Product not found' },
  };
}