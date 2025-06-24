/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/brands-tags/page.tsx
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Package, Tag, TrendingUp, Star } from 'lucide-react'
import { getBrandsWithProductCount, getBrandTagStatistics, getTagsWithProductCount } from '@/lib/actions/product.actions'
import { getTranslations } from 'next-intl/server'

// Loading component
function LoadingCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  )
}

// Statistics Overview Component
async function StatisticsOverview() {
  const { success, statistics } = await getBrandTagStatistics()
  const t = await getTranslations('BrandsTags')
  
  if (!success) {
    return <div>{t('FailedToLoadStatistics')}</div>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('TotalBrands')}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics?.totalBrands}</div>
          <p className="text-xs text-muted-foreground">
            {t('ActiveBrands')}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('TotalTags')}</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics?.totalTags}</div>
          <p className="text-xs text-muted-foreground">
            {t('TagsInUse')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Brands List Component
async function BrandsList() {
  const { success, brands } = await getBrandsWithProductCount()
  const t = await getTranslations('BrandsTags')
  
  if (!success) {
    return <div className="text-center py-8">{t('FailedToLoadBrands')}</div>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands?.map((brand: any) => (
        <Card key={brand.brand} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{brand.brand}</CardTitle>
              <Badge variant="secondary">
                {brand.productCount} {t('Products')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {t('Sold')}:
                </span>
                <span className="font-medium">{brand.totalSales}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {t('AvgRating')}:
                </span>
                <span className="font-medium">{brand.avgRating || 0}/5</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/admin/brands&tags/brand/${encodeURIComponent(brand.brand)}`}>
                <Button variant="outline" size="sm" className="w-full">
                  {t('ViewProducts')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Tags List Component
async function TagsList() {
  const { success, tags } = await getTagsWithProductCount()
  const t = await getTranslations('BrandsTags')
  
  if (!success) {
    return <div className="text-center py-8">{t('FailedToLoadTags')}</div>
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tags?.map((tag: any) => (
        <Card key={tag.tag} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">
                {tag.tag.split('-').join(' ')}
              </CardTitle>
              <Badge variant="outline">
                {tag.productCount} {t('Products')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {t('Sold')}:
                </span>
                <span className="font-medium">{tag.totalSales}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {t('AvgRating')}:
                </span>
                <span className="font-medium">{tag.avgRating || 0}/5</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/admin/brands&tags/tag/${encodeURIComponent(tag.tag)}`}>
                <Button variant="outline" size="sm" className="w-full">
                  {t('ViewProducts')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function BrandsTagsPage() {
  const t = await getTranslations('BrandsTags')
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('Title')}</h1>
        <p className="text-muted-foreground">
          {t('Description')}
        </p>
      </div>
      
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <LoadingCard />
        <LoadingCard />
      </div>}>
        <StatisticsOverview />
      </Suspense>
      
      <Tabs defaultValue="brands" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('Brands')}
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {t('Tags')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="brands" className="mt-6">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          }>
            <BrandsList />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="tags" className="mt-6">
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          }>
            <TagsList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}