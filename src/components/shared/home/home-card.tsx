"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, ExternalLink } from 'lucide-react'

type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
    badge?: string
    isNew?: boolean
  }[]
}

// Individual item component for better reusability
function CardItemComponent({ 
  item, 
  onImageLoad, 
  onImageError 
}: { 
  item: CardItem['items'][0]
  onImageLoad?: () => void
  onImageError?: () => void
}) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoading(false)
    onImageLoad?.()
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
    onImageError?.()
  }

  return (
    <Link
      href={item.href}
      className="group relative flex flex-col space-y-3 p-3 rounded-xl transition-all duration-300 hover:bg-muted/50 hover:shadow-md hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Badge for special items */}
      {item.badge && (
        <Badge 
          variant={item.isNew ? "default" : "secondary"} 
          className="absolute -top-1 -right-1 z-10 text-xs px-2 py-1"
        >
          {item.badge}
        </Badge>
      )}

      {/* Image container with loading state */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {imageLoading && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        
        {!imageError ? (
          <Image
            src={item.image}
            alt={item.name}
            className={`
              aspect-square object-cover w-full h-full transition-all duration-300
              group-hover:scale-110
              ${imageLoading ? 'opacity-0' : 'opacity-100'}
            `}
            height={150}
            width={150}
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 mx-auto bg-muted-foreground/20 rounded-full flex items-center justify-center">
                <ExternalLink className="w-4 h-4" />
              </div>
              <span className="text-xs">No image</span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Item name with better typography */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {item.name}
        </h4>
        
        {/* Sub-items if available */}
        {item.items && item.items.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {item.items.slice(0, 2).join(', ')}
            {item.items.length > 2 && ` +${item.items.length - 2} more`}
          </p>
        )}
      </div>

      {/* Hover indicator */}
      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-0 group-hover:translate-x-1" />
    </Link>
  )
}

export function HomeCard({ cards }: { cards: CardItem[] }) {
  if (!cards || cards.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/50 backdrop-blur-sm"
        >
          {/* Card Header */}
          <CardHeader className="pb-3 space-y-2">
            <CardTitle className="text-lg font-bold text-foreground leading-tight flex items-center gap-2">
              {card.title}
              {index === 0 && (
                <Badge variant="outline" className="text-xs font-normal">
                  Popular
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          {/* Card Content */}
          <CardContent className="flex-1 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {card.items.slice(0, 4).map((item) => (
                <CardItemComponent
                  key={item.name}
                  item={item}
                />
              ))}
            </div>

            {/* Show count if more items available */}
            {card.items.length > 4 && (
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="text-xs">
                  +{card.items.length - 4} more items
                </Badge>
              </div>
            )}
          </CardContent>

          {/* Card Footer */}
          {card.link && (
            <CardFooter className="pt-0 pb-4">
              <Button 
                asChild 
                variant="ghost" 
                size="sm"
                className="w-full justify-between group/button hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Link href={card.link.href}>
                  <span className="font-medium">{card.link.text}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}