/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Tag, Star, Eye, Edit } from 'lucide-react'
import { getProductsByTagEnhanced } from '@/lib/actions/product.actions'
import ProductPrice from '@/components/shared/product/product-price'
import { getTranslations } from 'next-intl/server'

interface Props {
  params: Promise<{
    tag: string
  }>
  searchParams: Promise<{
    page?: string
    sort?: string
  }>
}

function ProductCard({ product, t }: { product: any, t: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative aspect-square">
        <Image
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <Badge variant={product.countInStock > 0 ? 'default' : 'destructive'}>
            {product.countInStock > 0 ? t('Product.InStock') : t('Product.OutOfStock')}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {product.brand}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              <ProductPrice price={product.price} plain />
            </span>
            {product.listPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                <ProductPrice price={product.listPrice} plain />
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{product.avgRating?.toFixed(1) || '0.0'}</span>
              <span className="text-muted-foreground">({product.numReviews} {t('Product.Reviews')})</span>
            </div>
            <span className="text-muted-foreground">{t('Product.Sold')}: {product.numSales}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags?.slice(0, 3).map((tag: string) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs hover:bg-secondary transition-colors"
              >
                {tag.split('-').map((word: string) => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
            ))}
            {product.tags?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2 mt-3">
            <Link href={`/product/${product.slug}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-3 w-3 mr-1" />
                {t('Product.View')}
              </Button>
            </Link>
            <Link href={`/admin/products/${product._id}`} className="flex-1">
              <Button size="sm" className="w-full">
                <Edit className="h-3 w-3 mr-1" />
                {t('Product.Edit')}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function TagProducts({ tag, page, sort, t }: { 
  tag: string, 
  page: number, 
  sort: string,
  t: any
}) {
  const { success, products, pagination } = await getProductsByTagEnhanced({
    tag: decodeURIComponent(tag),
    page,
    sort
  })
  
  if (!success || !products?.length) {
    return (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('NoProductsFound')}</h3>
        <p className="text-muted-foreground">
          {t('NoProductsDescription')}
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {t('ShowingProducts', {
            start: ((pagination?.page || 1) - 1) * (pagination?.limit || 12) + 1,
            end: Math.min((pagination?.page || 1) * (pagination?.limit || 12), pagination?.total || 0),
            total: pagination?.total
          })}
        </p>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm whitespace-nowrap">{t('SortBy')}</span>
          <Select defaultValue={sort}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('SortPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.raw('SortOptions')).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard key={product._id} product={product} t={t} />
        ))}
      </div>
      
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {page > 1 && (
            <Link 
              href={`/admin/brands&tags/tag/${tag}?page=${page - 1}&sort=${sort}`}
              scroll={false}
            >
              <Button variant="outline">{t('Previous')}</Button>
            </Link>
          )}
          
          <span className="text-sm text-muted-foreground mx-4">
            {t('PageInfo', {
              current: page,
              total: pagination.pages
            })}
          </span>
          
          {page < pagination.pages && (
            <Link 
              href={`/admin/brands&tags/tag/${tag}?page=${page + 1}&sort=${sort}`}
              scroll={false}
            >
              <Button variant="outline">{t('Next')}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default async function TagDetailPage({ params, searchParams }: Props) {
  const t = await getTranslations('Admin.TagProducts')
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  
  const tag = decodeURIComponent(resolvedParams.tag)
  const displayTag = tag.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
  const page = parseInt(resolvedSearchParams.page || '1')
  const sort = resolvedSearchParams.sort || 'latest'
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="mb-6">
        <Link href="/admin/brands&tags">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('BackToTags')}
          </Button>
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('TagTitle', { tag: displayTag })}
            </h1>
            <p className="text-muted-foreground">
              {t('TagDescription')}
            </p>
          </div>
          <Badge variant="secondary" className="text-sm self-start sm:self-auto">
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <TagProducts 
          tag={resolvedParams.tag} 
          page={page} 
          sort={sort}
          t={t}
        />
      </Suspense>
    </div>
  )
}