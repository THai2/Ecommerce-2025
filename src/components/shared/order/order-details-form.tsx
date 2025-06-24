/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IOrder } from '@/models/order'
import { cn, formatDateTime } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import { deliverOrder, updateOrderToPaid, cancelOrderByUser, cancelOrderByAdmin } from '@/lib/actions/order.actions'
import ActionButton from '../action-button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrder
  isAdmin: boolean
}) {
  const router = useRouter()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const t = useTranslations('Order')

  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
    isCancelled,
    cancelledAt,
    cancelledBy,
  } = order

  const handleCancelOrder = async () => {
    try {
      setIsCancelling(true)
      const result = isAdmin 
        ? await cancelOrderByAdmin(order._id)
        : await cancelOrderByUser(order._id)
      
      if (result.success) {
        toast.success(t('cancelSuccess'))
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(t('cancelError'))
    } finally {
      setIsCancelling(false)
      setShowCancelDialog(false)
    }
  }

  const canCancelOrder = !isCancelled && !isDelivered && (!isPaid || (isPaid && isAdmin))

  // Determine order status
  const getOrderStatus = () => {
    if (isCancelled) {
      return {
        text: t('status.cancelled', { by: cancelledBy === 'admin' ? t('status.byAdmin') : t('status.byYou') }),
        variant: 'destructive' as const,
        description: t('status.cancelledAt', { date: formatDateTime(cancelledAt!).dateTime }),
      }
    }
    
    if (isDelivered) {
      return {
        text: t('status.delivered'),
        variant: 'default' as const,
        description: t('status.deliveredAt', { date: formatDateTime(deliveredAt!).dateTime }),
      }
    }
    
    if (isPaid) {
      return {
        text: t('status.processing'),
        variant: 'default' as const,
        description: t('status.expectedDelivery', { date: formatDateTime(expectedDeliveryDate!).dateTime }),
      }
    }
    
    return {
      text: t('status.pending'),
      variant: 'outline' as const,
      description: t('status.waitingPayment'),
    }
  }

  const orderStatus = getOrderStatus()

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancelConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {isPaid 
                ? t('cancelConfirm.paidMessage')
                : t('cancelConfirm.unpaidMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              {t('cancelConfirm.cancelButton')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className={buttonVariants({ variant: 'destructive' })}
            >
              {isCancelling ? t('cancelConfirm.cancelling') : t('cancelConfirm.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='overflow-x-auto md:col-span-2 space-y-4'>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('shippingAddress')}</h2>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{' '}
              {shippingAddress.province}, {shippingAddress.postalCode},{' '}
              {shippingAddress.country}{' '}
            </p>

            <div className="mt-2">
              <Badge variant={orderStatus.variant} className="mb-2">
                {orderStatus.text}
              </Badge>
              <div>{orderStatus.description}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('paymentMethod')}</h2>
            <p>{paymentMethod}</p>
            {isPaid ? (
              <Badge>{t('payment.paidAt', { date: formatDateTime(paidAt!).dateTime })}</Badge>
            ) : (
              <Badge variant='outline'>{t('payment.notPaid')}</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('orderItems')}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.item')}</TableHead>
                  <TableHead>{t('table.quantity')}</TableHead>
                  <TableHead>{t('table.color')}</TableHead>
                  <TableHead>{t('table.size')}</TableHead>
                  <TableHead>{t('table.price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={`${item.slug}-${item.color}-${item.size}`}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        ></Image>
                        <span className='px-2'>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.quantity}</span>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.color}</span>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.size}</span>
                    </TableCell>
                    <TableCell className='text-right'><ProductPrice price={item.price} plain /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className='p-4 space-y-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('orderSummary')}</h2>
            <div className='flex justify-between'>
              <div>{t('summary.items')}</div>
              <div><ProductPrice price={itemsPrice} plain /></div>
            </div>
            <div className='flex justify-between'>
              <div>{t('summary.tax')}</div>
              <div><ProductPrice price={taxPrice} plain /></div>
            </div>
            <div className='flex justify-between'>
              <div>{t('summary.shipping')}</div>
              <div><ProductPrice price={shippingPrice} plain /></div>
            </div>
            <div className='flex justify-between'>
              <div>{t('summary.total')}</div>
              <div><ProductPrice price={totalPrice} plain /></div>
            </div>

            {!isCancelled && !isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
              <Link
                className={cn(buttonVariants(), 'w-full')}
                href={`/checkout/${order._id}`}
              >
                {t('actions.payOrder')}
              </Link>
            )}

            {!isCancelled && isAdmin && !isPaid && paymentMethod === 'Cash On Delivery' && (
              <ActionButton
                caption={t('actions.markAsPaid')}
                action={() => updateOrderToPaid(order._id)}
              />
            )}

            {!isCancelled && isAdmin && isPaid && !isDelivered && (
              <ActionButton
                caption={t('actions.markAsDelivered')}
                action={() => deliverOrder(order._id)}
              />
            )}

            {canCancelOrder && (
              <ActionButton
                variant="destructive"
                caption={isAdmin ? t('actions.cancelOrderAdmin') : t('actions.cancelOrder')}
                action={async () => {
                  setShowCancelDialog(true)
                  return { success: true, message: '' }
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}