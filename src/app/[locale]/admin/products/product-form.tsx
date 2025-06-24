/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Trash2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
import { IProduct } from '@/models/product'
import { IProductVariant } from '@/models/product-variant'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { IProductInput } from '@/types'
import { toast } from 'sonner'
import { ImageUploader, ImagePreview } from '@/components/shared/image-uploader'
import { getProductVariants, upsertProductVariant, updateProductTotalStock } from '@/lib/actions/product-variant.action'
import { useTranslations } from 'next-intl'
import { CategorySelect } from '@/components/shared/category/category-select'

const productDefaultValues: IProductInput =
  process.env.NODE_ENV === 'development'
    ? {
      name: 'Sample Product',
      slug: 'sample-product',
      category: 'Sample Category',
      images: ['/images/p11-1.jpg'],
      brand: 'Sample Brand',
      description: 'This is a sample description of the product.',
      price: 99.99,
      listPrice: 0,
      countInStock: 0,
      numReviews: 0,
      avgRating: 0,
      numSales: 0,
      isPublished: false,
      tags: ['new arrival'],
      sizes: ['S', 'M', 'L'],
      colors: ['White', 'Red', 'Black'],
      ratingDistribution: [],
      reviews: [],
    }
    : {
      name: '',
      slug: '',
      category: '',
      images: [],
      brand: '',
      description: '',
      price: 0,
      listPrice: 0,
      countInStock: 0,
      numReviews: 0,
      avgRating: 0,
      numSales: 0,
      isPublished: false,
      tags: [],
      sizes: [],
      colors: [],
      ratingDistribution: [],
      reviews: [],
    }

// Optimized component for managing arrays (tags, colors, sizes)
const ArrayFieldManager = ({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
  suggestions = []
}: {
  label: string
  placeholder: string
  items: string[]
  onAdd: (item: string) => void
  onRemove: (item: string) => void
  suggestions?: string[]
}) => {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const t = useTranslations('Admin.Products')

  const filteredSuggestions = suggestions.filter(
    suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !items.includes(suggestion)
  )

  const handleAdd = () => {
    const trimmedValue = inputValue.trim()
    if (trimmedValue && !items.includes(trimmedValue)) {
      onAdd(trimmedValue)
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const addFromSuggestion = (suggestion: string) => {
    onAdd(suggestion)
    setInputValue('')
    setShowSuggestions(false)
  }

  return (
    <FormItem>
      <FormLabel className="flex items-center justify-between">
        {label}
        {items.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {t('ItemCount', { count: items.length })}
          </span>
        )}
      </FormLabel>
      <div className="space-y-3">
        <div className="relative">
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0)
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(inputValue.length > 0 && suggestions.length > 0)}
            />
            <Button
              type="button"
              onClick={handleAdd}
              disabled={!inputValue.trim() || items.includes(inputValue.trim())}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addFromSuggestion(suggestion)}
                  className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Display items */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item: string) => (
              <Badge
                key={item}
                variant="secondary"
                className="flex items-center gap-1 hover:bg-destructive/10 transition-colors group"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="hover:text-destructive transition-colors"
                  aria-label={t('RemoveItem', { item })}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  )
}

// Common suggestions
const COMMON_TAGS = ['new-arrival', 'best-seller', 'todays-deal', 'featured', 'may-sale-2025', 'june-sale-2025', 'summer-sale-2025', 'winter-sale-2025']
const COMMON_COLORS = ['White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray', 'Brown', 'Navy', 'Beige']
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28','29', '30','31', '32', '34', '36', '38', '39','40', '42']

// Component for managing variants
const ProductVariantManager = ({
  productId,
  colors,
  sizes,
  onStockUpdate
}: {
  productId: string
  colors: string[]
  sizes: string[]
  onStockUpdate?: (totalStock: number) => void
}) => {
  const [variants, setVariants] = useState<IProductVariant[]>([])
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [variantImages, setVariantImages] = useState<string[]>([])
  const [sizeStocks, setSizeStocks] = useState<{ size: string; stock: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [totalStock, setTotalStock] = useState(0)

  const t = useTranslations('Admin.Products')

  useEffect(() => {
    const loadVariants = async () => {
      const data = await getProductVariants(productId)
      setVariants(data)
      calculateTotalStock(data)
    }
    loadVariants()
  }, [productId])

  const calculateTotalStock = (variantList: IProductVariant[]) => {
    const total = variantList.reduce((sum, variant) => {
      return sum + variant.sizeStock.reduce((sizeSum, sizeStock) => sizeSum + sizeStock.stock, 0)
    }, 0)
    setTotalStock(total)
    onStockUpdate?.(total)
  }

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    const existingVariant = variants.find(v => v.color === color)

    if (existingVariant) {
      setVariantImages(existingVariant.images)
      setSizeStocks(existingVariant.sizeStock)
    } else {
      setVariantImages([])
      setSizeStocks(sizes.map(size => ({ size, stock: 0 })))
    }
  }

  const handleVariantImageUploaded = (imageData: { url: string; path: string }) => {
    setVariantImages(prev => [...prev, imageData.url])
    toast.success(t('Messages.VariantImageUploaded'))
  }

  const handleVariantImageRemove = (imageUrl: string) => {
    setVariantImages(prev => prev.filter(img => img !== imageUrl))
  }

  const handleSizeStockChange = (size: string, stock: number) => {
    setSizeStocks(prev =>
      prev.map(item =>
        item.size === size ? { ...item, stock } : item
      )
    )
  }

  const handleSaveVariant = async () => {
    if (!selectedColor) {
      toast.error(t('Messages.SelectColor'))
      return
    }

    setLoading(true)
    try {
      const result = await upsertProductVariant({
        productId,
        color: selectedColor,
        images: variantImages,
        sizeStock: sizeStocks,
      })

      if (result.success) {
        toast.success(t('Messages.VariantSaved'))
        const updatedVariants = await getProductVariants(productId)
        setVariants(updatedVariants)
        calculateTotalStock(updatedVariants)
        await updateProductTotalStock(productId)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error(t('Messages.VariantSaveFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (colors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('Messages.AddColorsFirst')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">{t('StockSummary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalStock}</div>
            <div className="text-sm text-muted-foreground">{t('TotalStock')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{variants.length}</div>
            <div className="text-sm text-muted-foreground">{t('Variants')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{colors.length}</div>
            <div className="text-sm text-muted-foreground">{t('Colors')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{sizes.length}</div>
            <div className="text-sm text-muted-foreground">{t('Sizes')}</div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">{t('SelectColorToManage')}</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {colors.map((color) => (
            <Button
              key={color}
              type="button"
              variant={selectedColor === color ? "default" : "outline"}
              size="sm"
              onClick={() => handleColorSelect(color)}
            >
              {color}
            </Button>
          ))}
        </div>
      </div>

      {selectedColor && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('Managing', { color: selectedColor })}</h3>

          <div>
            <label className="text-sm font-medium">{t('ImagesFor', { color: selectedColor })}</label>
            <Card>
              <CardContent className="space-y-4 mt-4 min-h-48">
                <div className="flex flex-wrap gap-3">
                  {variantImages.map((imageUrl: string) => (
                    <ImagePreview
                      key={imageUrl}
                      imageUrl={imageUrl}
                      onRemove={() => handleVariantImageRemove(imageUrl)}
                    />
                  ))}
                </div>
                <ImageUploader
                  onImageUploaded={handleVariantImageUploaded}
                  productSlug={`${productId}-${selectedColor}`}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <label className="text-sm font-medium">{t('StockBySize')}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {sizeStocks.map((item) => (
                <div key={item.size} className="space-y-2">
                  <label className="text-sm font-medium">{item.size}</label>
                  <Input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => handleSizeStockChange(item.size, parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {t('VariantTotal', { 
                total: sizeStocks.reduce((sum, s) => sum + s.stock, 0) 
              })}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSaveVariant}
            disabled={loading}
          >
            {loading ? t('Saving') : t('SaveVariant')}
          </Button>
        </div>
      )}

      {variants.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">{t('ExistingVariants')}</h3>
          <div className="space-y-2">
            {variants.map((variant) => (
              <div key={variant._id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">{variant.color}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {t('VariantInfo', {
                      images: variant.images.length,
                      stock: variant.sizeStock.reduce((sum, s) => sum + s.stock, 0)
                    })}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorSelect(variant.color)}
                >
                  {t('Edit')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
}) => {
  const router = useRouter()
  const t = useTranslations('Admin.Products')

  const form = useForm({
    resolver:
      type === 'Update'
        ? zodResolver(ProductUpdateSchema) as any
        : zodResolver(ProductInputSchema) as any,
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  const tags = form.watch('tags') || []
  const colors = form.watch('colors') || []
  const sizes = form.watch('sizes') || []

  const handleStockUpdate = (totalStock: number) => {
    form.setValue('countInStock', totalStock)
  }

  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createProduct(values)
      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success(t('Messages.ProductCreated'))
        router.push(`/admin/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/products`)
        return
      }
      const res = await updateProduct({ ...values, _id: productId })
      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success(t('Messages.ProductUpdated'))
      }
    }
  }

  const images = form.watch('images') || []
  const [imagePaths, setImagePaths] = useState<Record<string, string>>({})

  const handleImageUploaded = (imageData: { url: string; path: string }) => {
    form.setValue('images', [...images, imageData.url])
    setImagePaths(prev => ({
      ...prev,
      [imageData.url]: imageData.path
    }))
    toast.success(t('Messages.ImageUploaded'))
  }

  const handleImageRemove = (imageUrl: string) => {
    form.setValue('images', images.filter(img => img !== imageUrl))
    const imagePath = imagePaths[imageUrl]
    if (imagePath) {
      const newImagePaths = { ...imagePaths }
      delete newImagePaths[imageUrl]
      setImagePaths(newImagePaths)
    }
  }

  const handleAddTag = (tag: string) => {
    form.setValue('tags', [...tags, tag])
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddColor = (color: string) => {
    form.setValue('colors', [...colors, color])
  }

  const handleRemoveColor = (colorToRemove: string) => {
    form.setValue('colors', colors.filter(color => color !== colorToRemove))
  }

  const handleAddSize = (size: string) => {
    form.setValue('sizes', [...sizes, size])
  }

  const handleRemoveSize = (sizeToRemove: string) => {
    form.setValue('sizes', sizes.filter(size => size !== sizeToRemove))
  }

  return (
    <div className="space-y-6">
      {type === 'Update' ? (
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">{t('BasicInformation')}</TabsTrigger>
            <TabsTrigger value="variants">{t('VariantsAndStock')}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <ProductBasicForm
              form={form}
              onSubmit={onSubmit}
              type={type}
              images={images}
              imagePaths={imagePaths}
              handleImageUploaded={handleImageUploaded}
              handleImageRemove={handleImageRemove}
              tags={tags}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              colors={colors}
              handleAddColor={handleAddColor}
              handleRemoveColor={handleRemoveColor}
              sizes={sizes}
              handleAddSize={handleAddSize}
              handleRemoveSize={handleRemoveSize}
            />
          </TabsContent>

          <TabsContent value="variants">
            {productId && (
              <ProductVariantManager
                productId={productId}
                colors={colors}
                sizes={sizes}
                onStockUpdate={handleStockUpdate}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <ProductBasicForm
          form={form}
          onSubmit={onSubmit}
          type={type}
          images={images}
          imagePaths={imagePaths}
          handleImageUploaded={handleImageUploaded}
          handleImageRemove={handleImageRemove}
          tags={tags}
          handleAddTag={handleAddTag}
          handleRemoveTag={handleRemoveTag}
          colors={colors}
          handleAddColor={handleAddColor}
          handleRemoveColor={handleRemoveColor}
          sizes={sizes}
          handleAddSize={handleAddSize}
          handleRemoveSize={handleRemoveSize}
        />
      )}
    </div>
  )
}

const ProductBasicForm = ({
  form,
  onSubmit,
  type,
  images,
  imagePaths,
  handleImageUploaded,
  handleImageRemove,
  tags,
  handleAddTag,
  handleRemoveTag,
  colors,
  handleAddColor,
  handleRemoveColor,
  sizes,
  handleAddSize,
  handleRemoveSize
}: any) => {
  const t = useTranslations('Admin.Products')

  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Placeholders.Name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Slug')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder={t('Placeholders.Slug')}
                      className='pr-20'
                      {...field}
                    />
                    <Button
                      type='button'
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        form.setValue('slug', toSlug(form.getValues('name')))
                      }}
                      className='absolute right-1 top-1'
                    >
                      {t('Generate')}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Category')}</FormLabel>
                <FormControl>
                  <CategorySelect
                    value={field.value}
                    onChange={field.onChange}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Brand')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Placeholders.Brand')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='listPrice'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('ListPrice')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Placeholders.ListPrice')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('NetPrice')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Placeholders.Price')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='countInStock'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('CountInStock')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder={t('Placeholders.CountInStock')}
                    {...field}
                    readOnly={type === 'Update'}
                  />
                </FormControl>
                {type === 'Update' && (
                  <FormDescription>
                    {t('StockAutoCalculated')}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='images'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel className="flex items-center justify-between">
                  {t('Images')}
                  {images.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {t('ImageCount', { count: images.length })}
                    </span>
                  )}
                </FormLabel>
                <Card>
                  <CardContent className='space-y-4 mt-4 min-h-48'>
                    <div className='flex flex-wrap gap-3'>
                      {images.map((imageUrl: string) => (
                        <ImagePreview
                          key={imageUrl}
                          imageUrl={imageUrl}
                          onRemove={() => handleImageRemove(imageUrl)}
                        />
                      ))}
                    </div>
                    <FormControl>
                      <ImageUploader onImageUploaded={handleImageUploaded} productSlug={''} />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='tags'
          render={() => (
            <ArrayFieldManager
              label={t('Tags')}
              placeholder={t('Placeholders.Tags')}
              items={tags}
              onAdd={handleAddTag}
              onRemove={handleRemoveTag}
              suggestions={COMMON_TAGS}
            />
          )}
        />

        <FormField
          control={form.control}
          name='colors'
          render={() => (
            <ArrayFieldManager
              label={t('Colors')}
              placeholder={t('Placeholders.Colors')}
              items={colors}
              onAdd={handleAddColor}
              onRemove={handleRemoveColor}
              suggestions={COMMON_COLORS}
            />
          )}
        />

        <FormField
          control={form.control}
          name='sizes'
          render={() => (
            <ArrayFieldManager
              label={t('Sizes')}
              placeholder={t('Placeholders.Sizes')}
              items={sizes}
              onAdd={handleAddSize}
              onRemove={handleRemoveSize}
              suggestions={COMMON_SIZES}
            />
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>{t('Description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('Placeholders.Description')}
                  className='resize-none min-h-[100px]'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='isPublished'
          render={({ field }) => (
            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>
                  {t('PublishProduct')}
                </FormLabel>
                <FormDescription>
                  {t('PublishDescription')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button
          type='submit'
          size='lg'
          disabled={form.formState.isSubmitting}
          className='button col-span-2 w-full'
        >
          {form.formState.isSubmitting ? t('Submitting') : `${type} ${t('Product')}`}
        </Button>
      </form>
    </Form>
  )
}

export default ProductForm