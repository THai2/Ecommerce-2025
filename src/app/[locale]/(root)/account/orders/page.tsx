import { Metadata } from 'next'
import Link from 'next/link'

import Pagination from '@/components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getMyOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/models/order'
import { formatDateTime, formatId } from '@/lib/utils'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'

const PAGE_TITLE = 'Your Orders'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

function getOrderStatus(order: IOrder) {
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
  const t = await getTranslations()
  const page = Number(searchParams.page) || 1
  const orders = await getMyOrders({
    page,
  })
  return (
    <div>
      <div className='flex gap-2'>
        <Link href='/account'>{t('Account.Your Account')}</Link>
        <span>›</span>
        <span>{t('Account.Your Orders')}</span>
      </div>
      <h1 className='h1-bold pt-4'>{t('Account.Your Orders')}</h1>
      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>{t('Account.Date')}</TableHead>
              <TableHead>{t('Account.Status')}</TableHead>
              <TableHead>{t('Account.Total')}</TableHead>
              <TableHead>{t('Account.Paid')}</TableHead>
              <TableHead>{t('Account.Delivered')}</TableHead>
              <TableHead>{t('Account.Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className=''>
                  {t('Account.You have no orders')}
                </TableCell>
              </TableRow>
            )}
            {orders.data.map((order: IOrder) => {
              const status = getOrderStatus(order)
              return (
                <TableRow key={order._id}>
                  <TableCell>
                    <Link href={`/account/orders/${order._id}`}>
                      {formatId(order._id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatDateTime(order.createdAt!).dateTime}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>
                      {t(`OrderStatus.${status.text}`)}
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
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered && order.deliveredAt ? (
                      <Badge>
                        {formatDateTime(order.deliveredAt).dateTime}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/account/orders/${order._id}`}>
                      <span className='px-2'>{t('Account.Details')}</span>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={page} totalPages={orders.totalPages} />
        )}
      </div>
      <BrowsingHistoryList className='mt-16' />
    </div>
  )
}