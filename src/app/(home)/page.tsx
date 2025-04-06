'use client';

import { useCarousels, useCategories, useProducts, useProductsByTag } from '@/hooks';
import { HomeCard } from '@/components/shared/home/homeCard';
import { HomeCarousel } from '@/components/shared/home/homeCarousel';
import { toSlug } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import ProductSlider from '@/components/shared/product/productSlider';
import { Loader2, AlertCircle } from 'lucide-react';

// Component for loading state
const LoadingState = ({ message = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-slate-50 rounded-lg">
    <Loader2 className="h-10 w-10 text-primary animate-spin" />
    <p className="text-slate-600 font-medium">{message}</p>
  </div>
);

// Component for error state
const ErrorState = ({ message = 'An error occurred while loading data. Please try again later.' }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-red-50 rounded-lg border border-red-100">
    <AlertCircle className="h-10 w-10 text-red-500" />
    <div className="text-center">
      <p className="text-red-600 font-medium">{message}</p>
      <button 
        className="mt-4 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  </div>
);

// Skeleton loader for carousel
const CarouselSkeleton = () => (
  <div className="w-full h-80 bg-slate-200 animate-pulse rounded-lg"></div>
);

// Skeleton loader for cards
const CardSkeleton = () => (
  <div className="space-y-4">
    <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md"></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-40 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-4 w-1/2 bg-slate-200 animate-pulse rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function HomePage() {
  // Call APIs using hooks with loading and error states
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories(4);
  const { products: newArrivals, loading: newArrivalsLoading, error: newArrivalsError } = useProducts('new-arrival', 4);
  const { products: featureds, loading: featuredsLoading, error: featuredsError } = useProducts('featured', 4);
  const { products: bestSellers, loading: bestSellersLoading, error: bestSellersError } = useProducts('best-seller', 4);
  const { products: todaysDeals, loading: todaysDealsLoading, error: todaysDealsError } = useProductsByTag('todays-deal');
  const { products: bestSellingProducts, loading: bestSellingLoading, error: bestSellingError } = useProductsByTag('best-seller');

  // Call API to get carousel data
  const { carousels, loading: carouselsLoading, error: carouselsError } = useCarousels();
  
  // Check if all data is loading
  const isAllLoading = categoriesLoading && newArrivalsLoading && featuredsLoading && 
                      bestSellersLoading && todaysDealsLoading && bestSellingLoading && carouselsLoading;

  // Check if there are any errors
  const hasAnyError = categoriesError || newArrivalsError || featuredsError || 
                     bestSellersError || todaysDealsError || bestSellingError || carouselsError;

  // If everything is loading
  if (isAllLoading) {
    return (
      <div className="space-y-6 p-4">
        <CarouselSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // If there's a general error
  if (hasAnyError) {
    return (
      <div className="p-4">
        <ErrorState message="Unable to load homepage data. Please check your network connection and try again." />
      </div>
    );
  }

  // Create data for cards
  const cards = [
    {
      title: 'Categories to explore',
      link: {
        text: 'See More',
        href: '/search',
      },
      items: categoriesLoading ? [] : categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
      isLoading: categoriesLoading,
      error: categoriesError,
    },
    {
      title: 'Explore New Arrivals',
      items: newArrivalsLoading ? [] : newArrivals,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
      isLoading: newArrivalsLoading,
      error: newArrivalsError,
    },
    {
      title: 'Discover Best Sellers',
      items: bestSellersLoading ? [] : bestSellers,
      link: {
        text: 'View All',
        href: '/search?tag=best-seller',
      },
      isLoading: bestSellersLoading,
      error: bestSellersError,
    },
    {
      title: 'Featured Products',
      items: featuredsLoading ? [] : featureds,
      link: {
        text: 'Shop Now',
        href: '/search?tag=featured',
      },
      isLoading: featuredsLoading,
      error: featuredsError,
    },
  ];

  // Map carousel data for HomeCarousel
  const carouselItems = carouselsLoading ? [] : carousels.map((carousel) => ({
    image: carousel.imageUrl,
    title: carousel.title,
    buttonCaption: carousel.buttonCaption,
    url: carousel.url,
  }));

  return (
    <>
      {carouselsLoading ? (
        <CarouselSkeleton />
      ) : carouselsError ? (
        <div className="p-4">
          <ErrorState message="Failed to load promotional banners." />
        </div>
      ) : (
        <HomeCarousel items={carouselItems} />
      )}

      <div className="md:p-4 md:space-y-4 bg-border">
        <HomeCard cards={cards} />

        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            {todaysDealsLoading ? (
              <LoadingState message="Loading Today's Deals..." />
            ) : todaysDealsError ? (
              <ErrorState message="Failed to load Today's Deals." />
            ) : (
              <ProductSlider title={"Today's Deals"} products={todaysDeals} />
            )}
          </CardContent>
        </Card>

        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            {bestSellingLoading ? (
              <LoadingState message="Loading Best Selling Products..." />
            ) : bestSellingError ? (
              <ErrorState message="Failed to load Best Selling Products." />
            ) : (
              <ProductSlider
                title="Best Selling Products"
                products={bestSellingProducts}
                hideDetails
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}