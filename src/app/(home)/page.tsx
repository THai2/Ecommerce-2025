'use client';

import { useCarousels, useCategories, useProducts, useProductsByTag } from '@/hooks';
import { HomeCard } from '@/components/shared/home/homeCard';
import { HomeCarousel } from '@/components/shared/home/homeCarousel';
import { toSlug } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import ProductSlider from '@/components/shared/product/productSlider';
import { Loader2, AlertCircle } from 'lucide-react';
import BrowsingHistoryList from '@/components/shared/browsing-history-list';

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
      <div className="bg-gray-50">
        {carouselsLoading ? (
          <CarouselSkeleton />
        ) : carouselsError ? (
          <Card className="mx-auto max-w-7xl mt-4">
            <CardContent className="min-h-[200px] flex items-center justify-center">
              <ErrorState message="Failed to load promotional banners" />
            </CardContent>
          </Card>
        ) : (
          <HomeCarousel items={carouselItems} />
        )}
      </div>
  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 lg:space-y-12">
        <HomeCard cards={cards} />
  
        {/* Today's Deals Section */}
        <Card className="rounded-lg shadow-sm overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Todays Deals</h2>
              <p className="text-gray-500 mt-1">Dont miss out on these limited offers</p>
            </div>
            {todaysDealsLoading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <LoadingState message="Loading Today's Deals..." />
              </div>
            ) : todaysDealsError ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <ErrorState message="Failed to load Today's Deals" />
              </div>
            ) : (
              <ProductSlider products={todaysDeals} />
            )}
          </CardContent>
        </Card>
  
        {/* Best Selling Section */}
        <Card className="rounded-lg shadow-sm overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
              <p className="text-gray-500 mt-1">Most popular products this week</p>
            </div>
            {bestSellingLoading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <LoadingState message="Loading Best Sellers..." />
              </div>
            ) : bestSellingError ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <ErrorState message="Failed to load Best Sellers" />
              </div>
            ) : (
              <ProductSlider
                products={bestSellingProducts}
                hideDetails
              />
            )}
          </CardContent>
        </Card>
        
        {/* Browsing History Section */}
        <div className='p-4 bg-background'>
          <BrowsingHistoryList />
        </div>
      </div>
    </>
  );
}