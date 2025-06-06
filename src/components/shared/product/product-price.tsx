'use client'
import useSettingStore from '@/hooks/use-setting-store'
import { cn, round2 } from '@/lib/utils'
import { useFormatter, useTranslations } from 'next-intl'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  forListing?: boolean
  plain?: boolean
}) => {
  const { getCurrency } = useSettingStore()
  const currency = getCurrency()
  const t = useTranslations()
  const format = useFormatter()

  const convertedPrice = round2(currency.convertRate * price)
  const convertedListPrice = round2(currency.convertRate * listPrice)
  const isVND = currency.code === 'VND'

  const discountPercent = Math.round(
    100 - (convertedPrice / convertedListPrice) * 100
  )

  const formatCurrency = (value: number) =>
    isVND
      ? `${round2(value).toLocaleString('vi-VN')} ₫`
      : format.number(value, {
          style: 'currency',
          currency: currency.code,
          currencyDisplay: 'narrowSymbol',
          maximumFractionDigits: 2,
        })

  const renderMainPrice = () =>
    isVND ? (
      <div className={cn('text-3xl', className)}>
        {Number(convertedPrice).toLocaleString('vi-VN')}
        <span className='ml-1'>{currency.symbol}</span>
      </div>
    ) : (
      (() => {
        const stringValue = convertedPrice.toFixed(2)
        const [intValue, floatValue] = stringValue.split('.')
        return (
          <div className={cn('text-3xl', className)}>
            <span className='text-xs align-super'>{currency.symbol}</span>
            {intValue}
            <span className='text-xs align-super'>.{floatValue}</span>
          </div>
        )
      })()
    )

  return plain ? (
    <>{formatCurrency(convertedPrice)}</>
  ) : convertedListPrice === 0 ? (
    renderMainPrice()
  ) : isDeal ? (
    <div className='space-y-2'>
      <div className='flex justify-center items-center gap-2'>
        <span className='bg-red-700 rounded-sm p-1 text-white text-sm font-semibold'>
          {discountPercent}% {t('Product.Off')}
        </span>
        <span className='text-red-700 text-xs font-bold'>
          {t('Product.Limited time deal')}
        </span>
      </div>
      <div
        className={`flex ${forListing && 'justify-center'} items-center gap-2`}
      >
        {renderMainPrice()}
        <div className='text-muted-foreground text-xs py-2'>
          {t('Product.Was')}:{' '}
          <span className='line-through'>
            {formatCurrency(convertedListPrice)}
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div className='flex justify-center gap-3'>
        <div className='text-3xl text-orange-700'>-{discountPercent}%</div>
        {renderMainPrice()}
      </div>
      <div className='text-muted-foreground text-xs py-2'>
        {t('Product.List price')}:{' '}
        <span className='line-through'>
          {formatCurrency(convertedListPrice)}
        </span>
      </div>
    </div>
  )
}

export default ProductPrice
