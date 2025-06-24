import { Metadata } from 'next'
import Link from 'next/link'

import DeleteDialog from '@/components/shared/delete-dialog'
import Pagination from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions'
import { formatDateTime, formatId } from '@/lib/utils'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import { auth } from '../../../../../auth'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Admin Orders',
}

function getOrderStatus(order: IOrderList) {
  if (order.isCancelled) {
    return {
      text: 'Cancelled',
      variant: 'destructive' as const,
    }
  }
  if (order.isDelivered) {
    return {
      text: 'Delivered',
      variant: 'default' as const,
    }
  }
  if (order.isPaid) {
    return {
      text: 'Processing',
      variant: 'default' as const,
    }
  }
  return {
    text: 'Pending',
    variant: 'outline' as const,
  }
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const searchParams = await props.searchParams
  const t = await getTranslations('Admin.orders')
  
  const { page = '1' } = searchParams

  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error(t('adminPermissionRequired'))

  const orders = await getAllOrders({
    page: Number(page),
  })

  return (
    <div className='space-y-4'>
      <h1 className='h1-bold'>{t('title')}</h1>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('id')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('buyer')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('total')}</TableHead>
              <TableHead>{t('paid')}</TableHead>
              <TableHead>{t('delivered')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className='text-center'>
                  {t('noOrders')}
                </TableCell>
              </TableRow>
            )}
            {orders.data.map((order: IOrderList) => {
              const status = getOrderStatus(order)
              return (
                <TableRow key={order._id}>
                  <TableCell>{formatId(order._id)}</TableCell>
                  <TableCell>
                    {formatDateTime(order.createdAt!).dateTime}
                  </TableCell>
                  <TableCell>
                    {order.user ? order.user.name : t('deletedUser')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>
                      {t(`statuses.${status.text}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ProductPrice price={order.totalPrice} plain />
                  </TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt ? (
                      <Badge>
                        {formatDateTime(order.paidAt).dateTime}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t('no')}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered && order.deliveredAt ? (
                      <Badge>
                        {formatDateTime(order.deliveredAt).dateTime}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{t('no')}</Badge>
                    )}
                  </TableCell>
                  <TableCell className='flex gap-1'>
                    <Button asChild variant='outline' size='sm'>
                      <Link href={`/admin/orders/${order._id}`}>
                        {t('details')}
                      </Link>
                    </Button>
                    <DeleteDialog 
                      id={order._id} 
                      action={deleteOrder} 
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={page} totalPages={orders.totalPages!} />
        )}
      </div>
    </div>
  )
}