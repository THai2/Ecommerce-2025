'use client'
import { redirect, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import useSettingStore from '@/hooks/use-setting-store'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignUp } from '@/types'
import { registerUser, signInWithCredentials } from '@/lib/actions/user.actions'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { Separator } from '@/components/ui/separator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { useTranslations } from 'next-intl'
import { firebaseSignUp } from '@/lib/firebase/config'

const signUpDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
      name: 'john doe',
      email: 'john@me.com',
      password: '123456',
      confirmPassword: '123456',
    }
    : {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }

export default function CredentialsSignInForm() {
  const {
    setting: { site },
  } = useSettingStore()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })

  const { control, handleSubmit } = form
  const t = useTranslations()

  const onSubmit = async (data: IUserSignUp) => {
    try {
      const firebaseResult = await firebaseSignUp(data.email, data.password, data.name)
      if (!firebaseResult.success) {
        toast.error(
          typeof firebaseResult.error === 'string'
            ? firebaseResult.error
            : t('Sign-up.Email account already in use')
        )
        return
      }
      const res = await registerUser(data)
      if (!res.success) {
        toast.error(res.message)
        return
      }
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      toast.error(t('Sign-up.Invalid email or password'))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-6'>
          <FormField
            control={control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Sign-up.Name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Sign-up.Enter your name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder={t('Sign-up.Enter email address')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Sign-up.Password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('Sign-up.Enter password')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Sign-up.Confirm Password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder={t('Sign-up.Confirm Password')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type='submit'>{t('Sign-up.Sign up')}</Button>
          </div>
          <div className='text-sm'>
            {t('Sign-up.By creating an account, you agree to')} {site.name}&apos;s{' '}
            <Link href='/page/conditions-of-use'>{t('Sign-up.Conditions of Use')}</Link> {t('Sign-up.and')}{' '}
            <Link href='/page/privacy-policy'> {t('Sign-up.Privacy Notice')} </Link>
          </div>
          <Separator className='mb-4' />
          <div className='text-sm'>
            {t('Sign-up.Already have an account?')}{' '}
            <Link className='link' href={`/sign-in?callbackUrl=${callbackUrl}`}>
              {t('Sign-up.Sign in')}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}