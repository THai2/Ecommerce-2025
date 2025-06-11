/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import ProductPrice from '@/components/shared/product/product-price'
import { Card, CardContent } from '@/components/ui/card'
import useColorStore from '@/hooks/use-color-store'
import { formatDateTime } from '@/lib/utils'
import { useTheme } from 'next-themes'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className='p-2'>
          <p>{label && formatDateTime(new Date(label)).dateOnly}</p>
          <p className='text-primary text-xl'>
            <ProductPrice price={payload[0].value} plain />
          </p>
        </CardContent>
      </Card>
    )
  }
  return null
}

const CustomXAxisTick: React.FC<any> = ({ x, y, payload }) => {
  return (
    <text x={x} y={y + 10} textAnchor='left' fill='#666' className='text-xs'>
      {formatDateTime(new Date(payload.value)).dateOnly}
    </text>
  )
}

const STROKE_COLORS: { [key: string]: { [key: string]: string } } = {
  Blue: { light: 'oklch(0.623 0.214 259.815)', dark: 'oklch(0.546 0.245 262.881)' },
  Violet: { light: 'oklch(0.606 0.25 292.717)', dark: 'oklch(0.541 0.281 293.009)' },
  Black: { light: 'oklch(0.21 0.006 285.885)', dark: 'oklch(0.92 0.004 286.32)' },
  Red: { light: 'oklch(0.637 0.237 25.331)', dark: 'oklch(0.637 0.237 25.331)' },
  Green: { light: 'oklch(0.546 0.154 152.199)', dark: 'oklch(0.628 0.165 151.696)' },
  Orange: { light: 'oklch(0.659 0.175 60.743)', dark: 'oklch(0.741 0.186 65.743)' },
  Pink: { light: 'oklch(0.681 0.239 347.887)', dark: 'oklch(0.763 0.25 347.887)' },
  Yellow: { light: 'oklch(0.768 0.157 90.849)', dark: 'oklch(0.768 0.157 90.849)' }
}

export default function SalesAreaChart({ data }: { data: any[] }) {
  const { theme } = useTheme()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cssColors, color } = useColorStore(theme)
  
  // Lấy màu stroke hiện tại
  const currentStrokeColor = STROKE_COLORS[color.name][theme || 'light']

  return (
    <ResponsiveContainer width='100%' height={400}>
      <AreaChart data={data}>
        <CartesianGrid horizontal={true} vertical={false} stroke='' />
        <XAxis dataKey='date' tick={<CustomXAxisTick />} interval={3} />
        <YAxis fontSize={12} tickFormatter={(value: number) => `$${value}`} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type='monotone'
          dataKey='totalSales'
          stroke={currentStrokeColor}
          strokeWidth={2}
          fill={currentStrokeColor}
          fillOpacity={0.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}