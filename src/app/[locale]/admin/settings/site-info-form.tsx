/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ISettingInput } from '@/types'
import { TrashIcon, Upload, Loader2 } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { toast } from 'sonner'

export default function SiteInfoForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { watch, control } = form
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const siteLogo = watch('site.logo')

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast('Please select a valid image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast('File size must not exceed 5MB')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Create a unique filename
      const timestamp = Date.now()
      const fileName = `site-logos/${timestamp}_${file.name}`
      const storageRef = ref(storage, fileName)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      setUploadProgress(50)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      setUploadProgress(100)

      // Update form value
      form.setValue('site.logo', downloadURL)

      toast('Image uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast('An error occurred while uploading the image. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async () => {
    if (!siteLogo) return

    try {
      // Extract file path from URL for Firebase Storage
      const url = new URL(siteLogo)
      const pathStart = url.pathname.indexOf('/o/') + 3
      const pathEnd = url.pathname.indexOf('?')
      const filePath = decodeURIComponent(
        url.pathname.substring(pathStart, pathEnd > 0 ? pathEnd : undefined)
      )

      // Delete from Firebase Storage
      const fileRef = ref(storage, filePath)
      await deleteObject(fileRef)

      // Clear form value
      form.setValue('site.logo', '')

      toast('Image deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      toast('An error occurred while deleting the image. Please try again.')
    }
  }

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>Site Info</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={control}
            name='site.name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter site name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='site.url'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Url</FormLabel>
                <FormControl>
                  <Input placeholder='Enter url' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className='flex flex-col gap-5 md:flex-row'>
          <div className='w-full text-left'>
            <FormField
              control={control}
              name='site.logo'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter image url' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {siteLogo && (
              <div className='flex my-2 items-center gap-2'>
                <img 
                  src={siteLogo} 
                  alt='logo' 
                  width={48} 
                  height={48}
                  className='rounded border object-cover'
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleDeleteImage}
                  disabled={isUploading}
                >
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </div>
            )}

            {!siteLogo && (
              <div className='mt-2'>
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept='image/*'
                  className='hidden'
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleFileSelect}
                  disabled={isUploading}
                  className='w-full'
                >
                  {isUploading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className='w-4 h-4 mr-2' />
                      Select image to upload
                    </>
                  )}
                </Button>
                {isUploading && (
                  <div className='mt-2 w-full bg-gray-200 rounded-full h-2'>
                    <div 
                      className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <FormField
            control={control}
            name='site.description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter description'
                    className='h-40'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={control}
            name='site.slogan'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Slogan</FormLabel>
                <FormControl>
                  <Input placeholder='Enter slogan name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='site.keywords'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input placeholder='Enter keywords' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={control}
            name='site.phone'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder='Enter phone number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='site.email'
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
        </div>
        
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={control}
            name='site.address'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder='Enter address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='site.copyright'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Copyright</FormLabel>
                <FormControl>
                  <Input placeholder='Enter copyright' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}