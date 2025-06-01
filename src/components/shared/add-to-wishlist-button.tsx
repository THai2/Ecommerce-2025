'use client'

import { useState, useTransition, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { addToWishlist, removeFromWishlist, checkInWishlist } from '@/lib/actions/wishlist.action'

interface AddToWishlistButtonProps {
  productId: string
  initialInWishlist?: boolean
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AddToWishlistButton({ 
  productId, 
  initialInWishlist = false,
  variant = 'icon',
  size = 'md',
  className 
}: AddToWishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [isPending, startTransition] = useTransition()
  const [isChecking, setIsChecking] = useState(true)

  // Check wishlist status on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const isInWishlist = await checkInWishlist(productId)
        setInWishlist(isInWishlist)
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkWishlistStatus()
  }, [productId])

  const handleWishlistToggle = () => {
    startTransition(async () => {
      try {
        if (inWishlist) {
          const result = await removeFromWishlist(productId)
          if (result.success) {
            setInWishlist(false)
            toast.success('Removed from wishlist')
          } else {
            toast.error(result.message || 'Failed to remove from wishlist')
          }
        } else {
          const result = await addToWishlist(productId)
          if (result.success) {
            setInWishlist(true)
            toast.success('Added to wishlist')
          } else {
            toast.error(result.message || 'Failed to add to wishlist')
          }
        }
      } catch (error) {
        console.error('Wishlist operation failed:', error)
        toast.error('An error occurred. Please try again.')
      }
    })
  }

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  if (isChecking) {
    return (
      <Button
        variant="ghost"
        size="icon"
        disabled
        className={cn(
          'rounded-full',
          size === 'sm' && 'h-8 w-8',
          size === 'md' && 'h-10 w-10', 
          size === 'lg' && 'h-12 w-12',
          className
        )}
      >
        <Heart className={cn(iconSize[size], 'opacity-50')} />
      </Button>
    )
  }

  if (variant === 'button') {
    return (
      <Button
        variant={inWishlist ? 'default' : 'outline'}
        onClick={handleWishlistToggle}
        disabled={isPending}
        className={cn(
          'gap-2 transition-all duration-200',
          inWishlist 
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
            : 'hover:bg-accent hover:text-accent-foreground',
          className
        )}
      >
        <Heart 
          className={cn(
            iconSize[size],
            'transition-all duration-200',
            inWishlist ? 'fill-current' : ''
          )}
        />
        {isPending 
          ? 'Processing...' 
          : inWishlist 
            ? 'In Wishlist' 
            : 'Add to Wishlist'
        }
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleWishlistToggle}
      disabled={isPending}
      className={cn(
        'rounded-full transition-all duration-200 hover:scale-105',
        inWishlist 
          ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600' 
          : 'hover:bg-accent hover:text-accent-foreground',
        size === 'sm' && 'h-8 w-8',
        size === 'md' && 'h-10 w-10', 
        size === 'lg' && 'h-12 w-12',
        className
      )}
      aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <Heart 
        className={cn(
          iconSize[size],
          'transition-all duration-200',
          inWishlist ? 'fill-current' : '',
          isPending && 'animate-pulse'
        )}
      />
    </Button>
  )
}