import { getNoCachedSetting } from '@/lib/actions/setting.actions'
import SettingNav from './setting-nav'

import { Metadata } from 'next'
import SettingForm from './setting-form'
import { auth } from '../../../../../auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Setting',
}
const SettingPage = async () => {
  const session = await auth()
    
      if (!session || session.user.role !== 'Admin') {
        redirect('/')
      }
  
  return (
    <div className='grid md:grid-cols-5 max-w-6xl mx-auto gap-4'>
      <SettingNav />
      <main className='col-span-4 '>
        <div className='my-8'>
          <SettingForm setting={await getNoCachedSetting()} />
        </div>
      </main>
    </div>
  )
}

export default SettingPage