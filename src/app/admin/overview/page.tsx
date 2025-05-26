import { Metadata } from 'next'
import { auth } from '../../../../auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()
  if (session?.user.role !== 'Admin')
    redirect('/signin')

}

export default DashboardPage