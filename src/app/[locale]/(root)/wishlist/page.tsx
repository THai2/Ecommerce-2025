/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getWishlist } from '@/lib/actions/wishlist.action'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { removeFromWishlist } from '@/lib/actions/wishlist.action'
import EmptyState from '@/components/shared/empty-state'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'
import { getTranslations } from 'next-intl/server'


export default async function WishlistPage() {
  const session = await auth()
  
  const t = await getTranslations()
  if (!session?.user) {
    return (
      <EmptyState
        title= {t('Wishlist.Unauthorized Access')} 
        description= {t('Wishlist.Please sign in to view your wishlist')} 
        actionText= {t('Wishlist.Sign In')} 
        actionHref="/sign-in"
      />
    )
  }

  const { success, wishlist } = await getWishlist()

  if (!success || !wishlist?.products || wishlist.products.length === 0) {
    return (
      <EmptyState
        title= {t('Wishlist.Your Wishlist is Empty')} 
        description={t('Wishlist.Start adding products you love to your wishlist')} 
        actionText={t('Wishlist.Browse Products')} 
        actionHref="/search?tag=todays-deal"
        icon={<Heart className="w-12 h-12 text-muted-foreground" />}
      />
    )
  }

  async function handleRemoveFromWishlist(formData: FormData) {
    'use server'
    const productId = formData.get('productId') as string
    await removeFromWishlist(productId)
    redirect('/wishlist') // Refresh the page after removal
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('Wishlist.Your Wishlist')} </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {wishlist.products.length} {wishlist.products.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.products.map((product: any) => (
          <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0 pb-4">
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-square">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-medium hover:underline line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="font-bold">${product.price.toFixed(2)}</span>
                  <form action={handleRemoveFromWishlist}>
                    <input type="hidden" name="productId" value={product._id.toString()} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      <span className="sr-only">{t('Wishlist.Remove from wishlist')} </span>
                    </Button>
                  </form>
                </div>
                <Button asChild className="w-full mt-2">
                  <Link href={`/product/${product.slug}`}>
                    {t('Wishlist.View Product')} 
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}