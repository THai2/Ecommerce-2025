import mongoose, { Schema, Document } from 'mongoose';

// Định nghĩa interface cho Carousel
export interface ICarousel extends Document {
  _id: string
  title: string;
  buttonCaption: string;
  imageUrl: string;
  url: string;
  isPublished: boolean;
}

// Định nghĩa schema
const CarouselSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    buttonCaption: { type: String, required: true },
    imageUrl: { type: String, required: true },
    url: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Tạo model
const Carousel = mongoose.models.Carousel || mongoose.model<ICarousel>('Carousel', CarouselSchema);

export default Carousel;