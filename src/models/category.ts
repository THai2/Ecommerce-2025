import { Document, Model, model, models, Schema } from 'mongoose'

export interface ICategoryInput {
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  parentCategory?: string
  sortOrder: number
}

export interface ICategory extends Document, ICategoryInput {
  _id: string
  createdAt: Date
  updatedAt: Date
  productCount?: number // For aggregated queries
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Slug cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
      min: [0, 'Sort order cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for better performance
categorySchema.index({ slug: 1 })
categorySchema.index({ isActive: 1 })
categorySchema.index({ parentCategory: 1 })
categorySchema.index({ sortOrder: 1 })

// Prevent creating circular parent-child relationships
categorySchema.pre('save', async function(next) {
  if (this.parentCategory && this.parentCategory.toString() === this._id.toString()) {
    throw new Error('Category cannot be its own parent')
  }
  next()
})

const Category = (models.Category as Model<ICategory>) || model<ICategory>('Category', categorySchema)

export default Category