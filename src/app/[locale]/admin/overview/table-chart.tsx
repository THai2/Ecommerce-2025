'use client'
import { getMonthName } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ProductPrice from '@/components/shared/product/product-price'

type TableChartProps = {
  labelType: 'month' | 'product'
  data: {
    label: string
    image?: string
    value: number
    id?: string
  }[]
}

interface ProgressBarProps {
  value: number // Accepts a number between 0 and 100
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  // Ensure value stays within 0-100 range
  const boundedValue = Math.min(100, Math.max(0, value))

  return (
    <div className='relative w-full h-4 overflow-hidden'>
      <div
        className='bg-primary h-full transition-all duration-300 rounded-lg'
        style={{
          width: `${boundedValue}%`,
          float: 'left', // Aligns the bar to start from the left
        }}
      />
    </div>
  )
}

export default function TableChart({
  labelType = 'month',
  data = [],
}: TableChartProps) {
  // Process data to merge duplicates and handle broken images
  const processedData = data.reduce((acc, current) => {
    // If labelType is product, merge duplicates
    if (labelType === 'product') {
      const existingItem = acc.find(item => item.label === current.label)
      if (existingItem) {
        // Merge values for duplicate products
        existingItem.value += current.value
        // Keep the first valid image found
        if (!existingItem.image && current.image) {
          existingItem.image = current.image
        }
        return acc
      }
    }
    
    return [...acc, { ...current }]
  }, [] as typeof data)

  const max = Math.max(...processedData.map((item) => item.value))
  const dataWithPercentage = processedData.map((x) => ({
    ...x,
    label: labelType === 'month' ? getMonthName(x.label) : x.label,
    percentage: max > 0 ? Math.round((x.value / max) * 100) : 0,
  }))

  return (
    <div className='space-y-3'>
      {dataWithPercentage.map(({ label, id, value, image, percentage }) => (
        <div
          key={`${label}-${id || ''}`}
          className='grid grid-cols-[100px_1fr_80px] md:grid-cols-[250px_1fr_80px] gap-2 space-y-4'
        >
          {labelType === 'product' ? (
            <Link 
              className='flex items-end' 
              href={id ? `/admin/products/${id}` : '#'}
            >
              <div className='relative w-9 h-9 rounded border mr-1 flex items-center justify-center bg-gray-100'>
                {image ? (
                  <Image
                    className='rounded border aspect-square object-scale-down'
                    src={image}
                    alt={label}
                    width={36}
                    height={36}
                    onError={(e) => {
                      // Fallback to empty image if error occurs
                      const target = e.target as HTMLImageElement
                      target.onerror = null
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBhdGggZD0iTTIxIDE1bC01LjYtNS42YTIgMiAwIDAgMC0yLjggMEwzIDE2Ii8+PC9zdmc+'
                    }}
                  />
                ) : (
                  <div className='text-gray-400 text-xs'>No Image</div>
                )}
              </div>
              <p className='text-center text-sm whitespace-nowrap overflow-hidden text-ellipsis'>
                {label}
              </p>
            </Link>
          ) : (
            <div className='flex items-end text-sm'>{label}</div>
          )}

          <ProgressBar value={percentage} />

          <div className='text-sm text-right flex items-center'>
            <ProductPrice price={value} plain />
          </div>
        </div>
      ))}
    </div>
  )
}