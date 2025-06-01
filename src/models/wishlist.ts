import { IWishlistInput } from '@/types'
import {
  Document,
  Model,
  model,
  models,
  Schema,
} from 'mongoose'

export interface IWishlist extends Document, IWishlistInput {
  _id: string
  createdAt: Date
  updatedAt: Date
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId as unknown as typeof String,
      ref: 'User',
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index cho user để tìm kiếm nhanh hơn
wishlistSchema.index({ user: 1 })

const Wishlist = (models.Wishlist as Model<IWishlist>) || model<IWishlist>('Wishlist', wishlistSchema)

export default Wishlist