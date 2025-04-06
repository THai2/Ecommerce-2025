'use client';

import { useProductMetadata, useRelatedProductsByCategory } from '@/hooks';
import { useParams, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import ProductGallery from '@/components/shared/product/productGallery';
import ProductPrice from '@/components/shared/product/productPrice';
import ProductSlider from '@/components/shared/product/productSlider';
import Rating from '@/components/shared/product/rating';
import SelectVariant from '@/components/shared/product/selectVariant';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProductDetails() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params?.slug as string;
  const page = Number(searchParams?.get('page') || '1');
  const color = searchParams?.get('color') || '';
  const size = searchParams?.get('size') || '';

  // Lấy product và metadata
  const { product, loading: productLoading, error: productError, metadata } = useProductMetadata(slug);

  // Lấy related products
  const { products: relatedProducts, loading: relatedLoading, error: relatedError } =
    useRelatedProductsByCategory({
      category: product?.category || '',
      productId: product?._id || '',
      page,
      limit: 4, // Giả định PAGE_SIZE = 4
    });

  if (productLoading) return <div>Loading product...</div>;
  if (productError) return <div>Error: {productError}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <>
      {/* Cập nhật metadata bằng next/head */}
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description || ''} />
      </Head>

      <div>
        <section>
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="col-span-2">
              <ProductGallery images={product.images} />
            </div>

            <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
              <div className="flex flex-col gap-3">
                <p className="p-medium-16 rounded-full bg-grey-500/10 text-grey-500">
                  Brand {product.brand} {product.category}
                </p>
                <h1 className="font-bold text-lg lg:text-xl">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <span>{product.avgRating.toFixed(1)}</span>
                  <Rating rating={product.avgRating} />
                  <span>{product.numReviews} ratings</span>
                </div>
                <Separator />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex gap-3">
                    <ProductPrice
                      price={product.price}
                      listPrice={product.listPrice}
                      isDeal={product.tags.includes('todays-deal')}
                      forListing={false}
                    />
                  </div>
                </div>
              </div>
              <div>
                <SelectVariant
                  product={product}
                  size={size || product.sizes[0]}
                  color={color || product.colors[0]}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2">
                <p className="p-bold-20 text-grey-600">Description:</p>
                <p className="p-medium-16 lg:p-regular-18">{product.description}</p>
              </div>
            </div>
            <div>
              <Card>
                <CardContent className="p-4 flex flex-col gap-4">
                  <ProductPrice price={product.price} />
                  {product.countInStock > 0 && product.countInStock <= 3 && (
                    <div className="text-destructive font-bold">
                      {`Only ${product.countInStock} left in stock - order soon`}
                    </div>
                  )}
                  {product.countInStock !== 0 ? (
                    <div className="text-green-700 text-xl">In Stock</div>
                  ) : (
                    <div className="text-destructive text-xl">Out of Stock</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mt-10">
          {relatedLoading ? (
            <div>Loading related products...</div>
          ) : relatedError ? (
            <div>Error: {relatedError}</div>
          ) : (
            <ProductSlider
              products={relatedProducts}
              title={`Best Sellers in ${product.category}`}
            />
          )}
        </section>
      </div>
    </>
  );
}