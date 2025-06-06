'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { IProductVariant } from '@/models/product-variant'

interface ProductGalleryProps {
  mainImages: string[]
  variants?: IProductVariant[]
  selectedColor?: string
}

export default function ProductGallery({ 
  mainImages, 
  variants = [], 
  selectedColor 
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [displayImages, setDisplayImages] = useState<string[]>(mainImages)

  // Update images when color changes
  useEffect(() => {
    if (selectedColor && variants.length > 0) {
      const variant = variants.find(v => v.color === selectedColor)
      
      if (variant && variant.images.length > 0) {
        // Show variant images first, then main images
        setDisplayImages([...variant.images, ...mainImages])
      } else {
        // No variant images, show main images only
        setDisplayImages(mainImages)
      }
    } else {
      setDisplayImages(mainImages)
    }
    
    // Reset selected image when images change
    setSelectedImage(0)
  }, [selectedColor, variants, mainImages])

  if (displayImages.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    )
  }

  return (
    <div className='flex gap-2'>
      <div className='flex flex-col gap-2 mt-8'>
        {displayImages.map((image, index) => (
          <button
            key={`${selectedColor}-${index}`}
            onClick={() => {
              setSelectedImage(index)
            }}
            onMouseOver={() => {
              setSelectedImage(index)
            }}
            className={`bg-white rounded-lg overflow-hidden transition-all ${
              selectedImage === index
                ? 'ring-2 ring-blue-500'
                : 'ring-1 ring-gray-300'
            }`}
          >
            <div className="relative w-12 h-12">
              <Image
                src={image}
                alt={`product image ${index + 1}`}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      <div className='w-full'>
        <Zoom>
          <div className='relative h-[500px]'>
            <Image
              src={displayImages[selectedImage]}
              alt={`product image ${selectedImage + 1}`}
              fill
              sizes='90vw'
              className='object-contain'
              priority
            />
            {/* Variant indicator */}
            {selectedColor && variants.find(v => v.color === selectedColor)?.images.includes(displayImages[selectedImage]) && (
              <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-md text-sm">
                {selectedColor}
              </div>
            )}
          </div>
        </Zoom>
      </div>
    </div>
  )
}