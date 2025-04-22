'use client'
import {  useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
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
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignUpSchema } from '@/lib/validator'
import { Separator } from '@/components/ui/separator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { APP_NAME } from '@/lib/constants'
import { toast } from 'sonner'
import { useState } from 'react'

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

export default function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignUp) => {
    try {
      setIsLoading(true)
      const res = await registerUser(data)
      
      if (!res.success) {
        toast.error('Error', {
          description: res.error,
        })
        setIsLoading(false)
        return
      }
      
      // Hiển thị toast thành công trước khi đăng nhập
      toast.success('Success', {
        description: 'Account created successfully',
      })
      
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      
      router.push(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      
      toast.error('Error', {
        description: 'Invalid email or password',
      })
    } finally {
      setIsLoading(false)
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
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter name address' {...field} />
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
                  <Input placeholder='Enter email address' {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter password'
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Confirm Password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </div>
          <div className='text-sm'>
            By creating an account, you agree to {APP_NAME}&apos;s{' '}
            <Link href='/page/conditions-of-use'>Conditions of Use</Link> and{' '}
            <Link href='/page/privacy-policy'> Privacy Notice. </Link>
          </div>
          <Separator className='mb-4' />
          <div className='text-sm'>
            Already have an account?{' '}
            <Link className='link' href={`/signin?callbackUrl=${callbackUrl}`}>
              Sign In
            </Link>
          </div>
        </div>
      </form>
    </Form>
  )
}