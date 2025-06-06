import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '../../../../../auth'
import CarouselList from './carousel-list'

export const metadata: Metadata = {
  title: 'Admin Carousels',
}

export default async function AdminCarouselsPage() {
  const session = await auth()

  if (!session || session.user.role !== 'Admin') {
    redirect('/signin')
  }

  return (
    <CarouselList />
  )
}