import { Suspense } from 'react'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getAllPublishedCarousels } from '@/lib/actions/carousel.action'
import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from '@/lib/actions/product.actions'
import { toSlug } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

// Loading skeleton components
function CarouselSkeleton() {
  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] rounded-lg bg-muted animate-pulse" />
  )
}

function ProductSliderSkeleton() {
  return (
    <Card className="w-full border-0 shadow-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[200px] h-[250px] rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HomeCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-20 w-full rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  
  // Parallel data fetching for better performance
  const [
    { carousels },
    todaysDeals,
    bestSellingProducts,
    categories,
    newArrivals,
    featureds,
    bestSellers
  ] = await Promise.all([
    getAllPublishedCarousels({ limit: 5 }),
    getProductsByTag({ tag: 'todays-deal' }),
    getProductsByTag({ tag: 'best-seller' }),
    getAllCategories().then(cats => cats.slice(0, 4)),
    getProductsForCard({ tag: 'new-arrival' }),
    getProductsForCard({ tag: 'featured' }),
    getProductsForCard({ tag: 'best-seller' })
  ])

  // Transform carousel data
  const carouselItems = carousels.map((carousel) => ({
    image: carousel.imageUrl,
    url: carousel.url || '#',
    title: carousel.title || 'Featured Item',
    buttonCaption: carousel.buttonCaption || 'Shop Now',
  }))

  // Fixed link hrefs for better navigation
  const cards = [
    {
      title: t('Categories to explore'),
      link: {
        text: t('See More'),
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: t('Explore New Arrivals'),
      items: newArrivals,
      link: {
        text: t('View All'),
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: t('Discover Best Sellers'),
      items: bestSellers,
      link: {
        text: t('View All'),
        href: '/search?tag=best-seller', // Fixed link
      },
    },
    {
      title: t('Featured Products'),
      items: featureds,
      link: {
        text: t('Shop Now'),
        href: '/search?tag=featured', // Fixed link
      },
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="w-full bg-background">
        <div className="container mx-auto px-4 py-0 md:py-4">
          {carouselItems.length > 0 ? (
            <div className="w-full overflow-hidden rounded-none md:rounded-xl shadow-sm">
              <Suspense fallback={<CarouselSkeleton />}>
                <HomeCarousel items={carouselItems} />
              </Suspense>
            </div>
          ) : (
            <CarouselSkeleton />
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8 md:space-y-12">
        
        {/* Categories & Featured Cards */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('Discover Our Collections')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('Explore curated categories and featured products tailored just for you')}
            </p>
          </div>
          
          <Suspense fallback={<HomeCardSkeleton />}>
            <HomeCard cards={cards} />
          </Suspense>
        </section>

        <Separator className="my-8" />

        {/* Today's Deals */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="destructive" className="text-sm font-semibold">
              {t('LIMITED TIME')}
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {t("Today's Special Deals")}
            </h2>
          </div>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
            <CardContent className="p-4 md:p-6">
              <Suspense fallback={<ProductSliderSkeleton />}>
                <ProductSlider 
                  title="" 
                  products={todaysDeals}
                />
              </Suspense>
            </CardContent>
          </Card>
        </section>

        {/* Best Sellers */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm font-semibold">
              {t('TRENDING')}
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {t('Best Selling Products')}
            </h2>
          </div>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-4 md:p-6">
              <Suspense fallback={<ProductSliderSkeleton />}>
                <ProductSlider
                  title=""
                  products={bestSellingProducts}
                  hideDetails
                />
              </Suspense>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Browsing History Section */}
      <section className="bg-muted/30 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {t('Continue Where You Left Off')}
            </h2>
            <p className="text-muted-foreground">
              {t('Your recently viewed products and recommendations')}
            </p>
            
            <Suspense fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            }>
              <BrowsingHistoryList />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}