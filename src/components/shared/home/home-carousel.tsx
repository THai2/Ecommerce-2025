'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function HomeCarousel({
  items,
}: {
  items: {
    image: string
    url: string
    title: string
    buttonCaption: string
  }[]
}) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-xl">
      <Carousel
        dir='ltr'
        plugins={[plugin.current]}
        className='w-full mx-auto'
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.title} className="relative">
              <Link href={item.url} className="block w-full">
                <div className="relative aspect-[16/6] overflow-hidden">
                  {/* Image with gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  
                  {/* Content container */}
                  <div className="absolute z-20 w-full h-full flex items-center">
                    <div className="w-full md:w-1/2 px-6 md:px-16 lg:px-24">
                      <span className="inline-block mb-2 text-sm font-medium bg-primary/90 text-white px-3 py-1 rounded-full">
                        Slide {index + 1}
                      </span>
                      <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-4 text-white drop-shadow-md">
                        {item.title}
                      </h2>
                      <p className="text-white/90 mb-6 max-w-md hidden md:block">
                        Discover more about our amazing offerings and services.
                      </p>
                      <Button 
                        className="px-6 py-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        size="lg"
                      >
                        {item.buttonCaption}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation arrows */}
        <CarouselPrevious className="absolute left-4 md:left-8 bg-white/80 hover:bg-white text-primary z-20 -translate-y-1/2" />
        <CarouselNext className="absolute right-4 md:right-8 bg-white/80 hover:bg-white text-primary z-20 -translate-y-1/2" />
        
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {items.map((_, index) => (
            <span 
              key={index} 
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === 0 ? "bg-primary w-8" : "bg-white/60 hover:bg-white/90"
              )}
            />
          ))}
        </div>
      </Carousel>
    </div>
  )
}