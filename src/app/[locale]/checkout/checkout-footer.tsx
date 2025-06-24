'use client'

import useSettingStore from '@/hooks/use-setting-store'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function CheckoutFooter() {
  const {
    setting: { site },
  } = useSettingStore()
  const t = useTranslations('Checkout.Footer')

  return (
    <div className='border-t-2 space-y-2 my-4 py-4'>
      <p>
        {t.rich('NeedHelp', {
          helpLink: (chunks) => <Link href='/page/help'>{chunks}</Link>,
          contactLink: (chunks) => <Link href='/page/contact-us'>{chunks}</Link>
        })}
      </p>
      <p>
        {t.rich('OrderTerms', {
          siteName: site.name,
          privacyLink: (chunks) => <Link href='/page/privacy-policy'>{chunks}</Link>,
          termsLink: (chunks) => <Link href='/page/conditions-of-use'>{chunks}</Link>
        })}
      </p>
      <p>
        {t.rich('ReturnPolicy', {
          siteName: site.name,
          returnLink: (chunks) => <Link href='/page/returns-policy'>{chunks}</Link>
        })}
      </p>
    </div>
  )
}