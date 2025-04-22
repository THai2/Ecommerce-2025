'use client';

import { useCarousels, useCategories, useProducts, useProductsByTag } from '@/hooks';
import { HomeCard } from '@/components/shared/home/home-card';
import { HomeCarousel } from '@/components/shared/home/home-carousel';
import { toSlug } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import ProductSlider from '@/components/shared/product/product-slider';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import BrowsingHistoryList from '@/components/shared/browsing-history-list';

// Component for loading state
const LoadingState = ({ message = 'Loading data...' }) => (
  <div className="flex flex-col items-center justify-center p-4 md:p-8 space-y-3 bg-slate-50 rounded-lg">
    <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-primary animate-spin" />
    <p className="text-slate-600 font-medium text-sm md:text-base text-center">{message}</p>
  </div>
);

// Component for error state
const ErrorState = ({ message = 'An error occurred while loading data. Please try again later.' }) => (
  <div className="flex flex-col items-center justify-center p-4 md:p-8 space-y-3 bg-red-50 rounded-lg border border-red-100">
    <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-red-500" />
    <div className="text-center">
      <p className="text-red-600 font-medium text-sm md:text-base">{message}</p>
      <button 
        className="mt-3 px-3 py-1.5 md:px-4 md:py-2 bg-white text-red-600 text-sm border border-red-200 rounded-md hover:bg-red-50 transition-colors"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  </div>
);

// Skeleton loader for carousel
const CarouselSkeleton = () => (
  <div className="w-full h-40 sm:h-60 md:h-80 bg-slate-200 animate-pulse rounded-lg"></div>
);

// Skeleton loader for cards
const CardSkeleton = () => (
  <div className="space-y-3 md:space-y-4">
    <div className="h-6 md:h-8 w-36 md:w-48 bg-slate-200 animate-pulse rounded-md"></div>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-32 sm:h-36 md:h-40 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-3 md:h-4 w-3/4 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-3 md:h-4 w-1/2 bg-slate-200 animate-pulse rounded-md"></div>
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
      <div className="space-y-4 md:space-y-6 p-3 md:p-4">
        <CarouselSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // If there's a general error
  if (hasAnyError) {
    return (
      <div className="p-3 md:p-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Carousel Section - Enhanced Container */}
      <section aria-label="Promotional Banners" className="w-full bg-gradient-to-b from-gray-50 to-white py-2 md:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {carouselsLoading ? (
            <CarouselSkeleton />
          ) : carouselsError ? (
            <Card className="mx-auto max-w-7xl overflow-hidden shadow-md">
              <CardContent className="min-h-[200px] md:min-h-[250px] flex items-center justify-center p-4 md:p-6">
                <ErrorState message="Failed to load promotional banners" />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl overflow-hidden shadow-md">
              <HomeCarousel items={carouselItems} />
            </div>
          )}
        </div>
      </section>
  
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 space-y-8 md:space-y-10 lg:space-y-12">
        {/* Categories Section */}
        <section aria-label="Product Categories" className="bg-white rounded-xl shadow-sm p-4 md:p-6 lg:p-8">
          <HomeCard cards={cards} />
        </section>
  
        {/* Today's Deals Section - Enhanced UI */}
        <section aria-label="Today's Deals">
          <Card className="rounded-xl shadow-sm overflow-hidden border-0">
            <CardContent className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                    Today's Deals
                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full uppercase font-medium tracking-wide">Limited Time</span>
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Don't miss out on these limited offers</p>
                </div>
                
                <a 
                  href="/search?tag=todays-deal" 
                  className="hidden md:flex items-center text-primary hover:text-primary-dark transition mt-4 md:mt-0 text-sm font-medium"
                >
                  View all deals <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {todaysDealsLoading ? (
                  <div className="min-h-[250px] flex items-center justify-center">
                    <LoadingState message="Loading Today's Deals..." />
                  </div>
                ) : todaysDealsError ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <ErrorState message="Failed to load Today's Deals" />
                  </div>
                ) : (
                  <ProductSlider 
                    products={todaysDeals} 
                  />
                )}
              </div>
              
              <a 
                href="/search?tag=todays-deal" 
                className="md:hidden flex items-center justify-center text-primary hover:text-primary-dark transition mt-4 text-sm font-medium"
              >
                View all deals <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </section>
  
        {/* Best Selling Section - Enhanced UI */}
        <section aria-label="Best Sellers">
          <Card className="rounded-xl shadow-sm overflow-hidden border-0">
            <CardContent className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-amber-50 to-yellow-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                    Best Sellers
                    <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full uppercase font-medium tracking-wide">Popular</span>
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Most popular products this week</p>
                </div>
                
                <a 
                  href="/search?tag=best-seller" 
                  className="hidden md:flex items-center text-primary hover:text-primary-dark transition mt-4 md:mt-0 text-sm font-medium"
                >
                  View all best sellers <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {bestSellingLoading ? (
                  <div className="min-h-[250px] flex items-center justify-center">
                    <LoadingState message="Loading Best Sellers..." />
                  </div>
                ) : bestSellingError ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <ErrorState message="Failed to load Best Sellers" />
                  </div>
                ) : (
                  <ProductSlider
                    products={bestSellingProducts}
                    hideDetails
                  />
                )}
              </div>
              
              <a 
                href="/search?tag=best-seller" 
                className="md:hidden flex items-center justify-center text-primary hover:text-primary-dark transition mt-4 text-sm font-medium"
              >
                View all best sellers <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        </section>
        
        {/* Browsing History Section - Enhanced UI */}
        <section aria-label="Browsing History" className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <p className="text-sm md:text-base text-gray-600 mt-1">Continue browsing from where you left off</p>
            </div>
            <BrowsingHistoryList />
          </div>
        </section>
      </main>
    </div>
  );
}