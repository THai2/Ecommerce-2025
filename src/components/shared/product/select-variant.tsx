'use client'

import { Button } from '@/components/ui/button'
import { IProduct } from '@/models/product'
import { IProductVariant } from '@/models/product-variant'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

interface SelectVariantProps {
  product: IProduct
  variants: IProductVariant[]
  color: string
  size: string
}

export default function SelectVariant({
  product,
  variants,
  size,
  color,
}: SelectVariantProps) {
  const selectedColor = color || product.colors[0]
  const selectedSize = size || product.sizes[0]
  const t = useTranslations()
  
  // Get current variant
  const currentVariant = variants.find(v => v.color === selectedColor)
  
  // Get stock for specific size
  const getStockForSize = (sizeValue: string) => {
    if (!currentVariant) return 0
    
    const sizeStock = currentVariant.sizeStock.find(ss => ss.size === sizeValue)
    return sizeStock ? sizeStock.stock : 0
  }
  
  // Get total stock for a color
  const getTotalStockForColor = (colorValue: string) => {
    const variant = variants.find(v => v.color === colorValue)
    if (!variant) return 0
    
    return variant.sizeStock.reduce((total, ss) => total + ss.stock, 0)
  }

  return (
    <>
      {product.colors.length > 0 && (
        <div className='space-y-2'>
          <div className="font-medium">{t('Product.Color:')} <span className="font-normal">{selectedColor}</span></div>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((x: string) => {
              const totalStock = getTotalStockForColor(x)
              const isOutOfStock = totalStock === 0
              
              return (
                <Button
                  asChild
                  variant='outline'
                  className={cn(
                    "relative",
                    selectedColor === x ? 'border-2 border-primary' : 'border-2',
                    isOutOfStock && 'opacity-50'
                  )}
                  key={x}
                  disabled={isOutOfStock}
                >
                  <Link
                    replace
                    scroll={false}
                    href={`?${new URLSearchParams({
                      color: x,
                      size: selectedSize,
                    })}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: x.toLowerCase() }}
                        className='h-4 w-4 rounded-full border border-muted-foreground'
                      />
                      <span>{x}</span>
                      {isOutOfStock && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {t('Product.Out')}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      )}
      
      {product.sizes.length > 0 && (
        <div className='mt-4 space-y-2'>
          <div className="font-medium">Size: <span className="font-normal">{selectedSize}</span></div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((x: string) => {
              const stock = getStockForSize(x)
              const isOutOfStock = stock === 0
              const isLowStock = stock > 0 && stock <= 3
              
              return (
                <Button
                  asChild
                  variant='outline'
                  className={cn(
                    "relative min-w-[60px]",
                    selectedSize === x ? 'border-2 border-primary' : 'border-2',
                    isOutOfStock && 'opacity-50'
                  )}
                  key={x}
                  disabled={isOutOfStock}
                >
                  <Link
                    replace
                    scroll={false}
                    href={`?${new URLSearchParams({
                      color: selectedColor,
                      size: x,
                    })}`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{x}</span>
                      {isOutOfStock ? (
                        <span className="text-xs text-muted-foreground">{t('Product.Out')}</span>
                      ) : isLowStock ? (
                        <span className="text-xs text-orange-600">{stock} {t('Product.left')}</span>
                      ) : (
                        <span className="text-xs text-green-600">{t('Product.In stock')}</span>
                      )}
                    </div>
                  </Link>
                </Button>
              )
            })}
          </div>
          
          {/* Stock info for selected size */}
          {currentVariant && (
            <div className="mt-2 text-sm">
              {getStockForSize(selectedSize) > 0 ? (
                <p className="text-green-600">
                  {getStockForSize(selectedSize)} {t('Product.available in')} {selectedColor} - {selectedSize}
                </p>
              ) : (
                <p className="text-red-600">
                  {t('Product.Out of stock in')} {selectedColor} - {selectedSize}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}