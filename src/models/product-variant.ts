import { Document, Model, model, models, Schema } from 'mongoose'

// Interface cho variant của sản phẩm
export interface IProductVariant extends Document {
  _id: string
  productId: string // Reference đến Product
  color: string
  images: string[] // Ảnh theo màu sắc
  sizeStock: {
    size: string
    stock: number
  }[]
  createdAt: Date
  updatedAt: Date
}

// Schema cho ProductVariant
const productVariantSchema = new Schema<IProductVariant>(
  {
    productId: {
      type: String,
      required: true,
      index: true, // Index để query nhanh
    },
    color: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    sizeStock: [
      {
        size: {
          type: String,
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Compound index cho productId và color để đảm bảo unique
productVariantSchema.index({ productId: 1, color: 1 }, { unique: true })

const ProductVariant =
  (models.ProductVariant as Model<IProductVariant>) ||
  model<IProductVariant>('ProductVariant', productVariantSchema)

export default ProductVariant