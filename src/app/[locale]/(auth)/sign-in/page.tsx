import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '../../../../../auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import CredentialsSignInForm from './credentials-signin-form'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'
import { GoogleSignInForm } from './google-signin-form'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams
  const { site } = await getSetting()

  const { callbackUrl = '/' } = searchParams
  const t = await getTranslations()

  const session = await auth()
  if (session) {
    return redirect(callbackUrl)
  }

  return (
    <div className='w-full'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>{t('Sign-in.Sign in')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <CredentialsSignInForm />
            <SeparatorWithOr />
            <div className='mt-4'>
               <GoogleSignInForm />
            </div>
          </div>
        </CardContent>
      </Card>
      <SeparatorWithOr>{t('Sign-in.New to')} {site.name}?</SeparatorWithOr>

      <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
        <Button className='w-full' variant='outline'>
          {t('Sign-in.Create your')}  {site.name} {t('Sign-in.account')} 
        </Button>
      </Link>
    </div>
  )
}