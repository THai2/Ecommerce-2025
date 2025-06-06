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
import { getProductVariants, upsertProductVariant } from '@/lib/actions/product-variant.action'

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
        countInStock: 15,
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
            {items.length} item{items.length !== 1 ? 's' : ''}
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
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Bulk actions */}
        {items.length > 1 && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`Are you sure you want to remove all ${items.length} ${label.toLowerCase()}?`)) {
                  items.forEach(item => onRemove(item))
                }
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  )
}

// Common suggestions for better UX
const COMMON_TAGS = ['new arrival', 'bestseller', 'sale', 'limited edition', 'premium', 'eco-friendly', 'trending', 'seasonal']
const COMMON_COLORS = ['White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Gray', 'Brown', 'Navy', 'Beige']
const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '28', '30', '32', '34', '36', '38', '40', '42']

// Component for managing variants
const ProductVariantManager = ({ 
  productId, 
  colors, 
  sizes 
}: { 
  productId: string
  colors: string[]
  sizes: string[]
}) => {
  const [variants, setVariants] = useState<IProductVariant[]>([])
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [variantImages, setVariantImages] = useState<string[]>([])
  const [sizeStocks, setSizeStocks] = useState<{ size: string; stock: number }[]>([])
  const [loading, setLoading] = useState(false)

  // Load variants when component mounts
  useEffect(() => {
    const loadVariants = async () => {
      const data = await getProductVariants(productId)
      setVariants(data)
    }
    loadVariants()
  }, [productId])

  // Initialize size stocks when color is selected
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

  // Handle image upload for variant
  const handleVariantImageUploaded = (imageData: { url: string; path: string }) => {
    setVariantImages(prev => [...prev, imageData.url])
    toast.success('Variant image uploaded successfully')
  }

  // Remove variant image
  const handleVariantImageRemove = (imageUrl: string) => {
    setVariantImages(prev => prev.filter(img => img !== imageUrl))
  }

  // Update size stock
  const handleSizeStockChange = (size: string, stock: number) => {
    setSizeStocks(prev => 
      prev.map(item => 
        item.size === size ? { ...item, stock } : item
      )
    )
  }

  // Save variant
  const handleSaveVariant = async () => {
    if (!selectedColor) {
      toast.error('Please select a color')
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
        toast.success('Variant saved successfully')
        // Reload variants
        const updatedVariants = await getProductVariants(productId)
        setVariants(updatedVariants)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to save variant')
    } finally {
      setLoading(false)
    }
  }

  if (colors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Please add colors in the Basic Information tab first to manage variants.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      <div>
        <label className="text-sm font-medium">Select Color to Manage</label>
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
          <h3 className="text-lg font-medium">Managing: {selectedColor}</h3>
          
          {/* Variant Images */}
          <div>
            <label className="text-sm font-medium">Images for {selectedColor}</label>
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

          {/* Size Stock Management */}
          <div>
            <label className="text-sm font-medium">Stock by Size</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {sizeStocks.map((item) => (
                <div key={item.size} className="space-y-2">
                  <label className="text-sm">{item.size}</label>
                  <Input
                    type="number"
                    min="0"
                    value={item.stock}
                    onChange={(e) => handleSizeStockChange(item.size, parseInt(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            type="button"
            onClick={handleSaveVariant}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Variant'}
          </Button>
        </div>
      )}

      {/* Variants Summary */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Existing Variants</h3>
          <div className="space-y-2">
            {variants.map((variant) => (
              <div key={variant._id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <span className="font-medium">{variant.color}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {variant.images.length} images, {variant.sizeStock.reduce((sum, s) => sum + s.stock, 0)} total stock
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorSelect(variant.color)}
                >
                  Edit
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

  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createProduct(values)
      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success(res.message)
        // Redirect to update form to manage variants
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
        toast.success('Product updated successfully')
      }
    }
  }

  // Image handling
  const images = form.watch('images') || []
  const [imagePaths, setImagePaths] = useState<Record<string, string>>({})
  
  const handleImageUploaded = (imageData: { url: string; path: string }) => {
    form.setValue('images', [...images, imageData.url])
    setImagePaths(prev => ({
      ...prev,
      [imageData.url]: imageData.path
    }))
    toast.success('Image uploaded successfully')
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

  // Array field handlers
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
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="variants">Variants & Stock</TabsTrigger>
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

// Separate component for the basic form
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
}: any) => (
  <Form {...form}>
    <form
      method='post'
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-8'
    >
      {/* Basic Info Fields */}
      <div className='flex flex-col gap-5 md:flex-row'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter product name' {...field} />
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
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <div className='relative'>
                  <Input
                    placeholder='Enter product slug'
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
                    Generate
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
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder='Enter category' {...field} />
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
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder='Enter product brand' {...field} />
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
              <FormLabel>List Price</FormLabel>
              <FormControl>
                <Input placeholder='Enter product list price' {...field} />
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
              <FormLabel>Net Price</FormLabel>
              <FormControl>
                <Input placeholder='Enter product price' {...field} />
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
              <FormLabel>Count In Stock</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='Enter product count in stock'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Images */}
      <div className='flex flex-col gap-5 md:flex-row'>
        <FormField
          control={form.control}
          name='images'
          render={() => (
            <FormItem className='w-full'>
              <FormLabel className="flex items-center justify-between">
                Images
                {images.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {images.length} image{images.length !== 1 ? 's' : ''}
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

      {/* Tags */}
      <FormField
        control={form.control}
        name='tags'
        render={() => (
          <ArrayFieldManager
            label="Tags"
            placeholder="Add new tag"
            items={tags}
            onAdd={handleAddTag}
            onRemove={handleRemoveTag}
            suggestions={COMMON_TAGS}
          />
        )}
      />

      {/* Colors */}
      <FormField
        control={form.control}
        name='colors'
        render={() => (
          <ArrayFieldManager
            label="Colors"
            placeholder="Add new color"
            items={colors}
            onAdd={handleAddColor}
            onRemove={handleRemoveColor}
            suggestions={COMMON_COLORS}
          />
        )}
      />

      {/* Sizes */}
      <FormField
        control={form.control}
        name='sizes'
        render={() => (
          <ArrayFieldManager
            label="Sizes"
            placeholder="Add new size"
            items={sizes}
            onAdd={handleAddSize}
            onRemove={handleRemoveSize}
            suggestions={COMMON_SIZES}
          />
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem className='w-full'>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder='Enter product description'
                className='resize-none min-h-[100px]'
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Published */}
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
                Publish Product
              </FormLabel>
              <FormDescription>
                Make this product visible to customers
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
        {form.formState.isSubmitting ? 'Submitting...' : `${type} Product`}
      </Button>
    </form>
  </Form>
)

export default ProductForm