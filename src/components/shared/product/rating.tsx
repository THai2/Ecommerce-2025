import React from 'react'
import { Star } from 'lucide-react'

// Tạo map cho kích thước để tránh vấn đề với Tailwind CSS
const sizeClassMap = {
  4: "w-4 h-4",
  5: "w-5 h-5",
  6: "w-6 h-6", 
  8: "w-8 h-8",
  10: "w-10 h-10",
  12: "w-12 h-12"
} as const

type SizeKey = keyof typeof sizeClassMap;

export default function Rating({
  rating = 0,
  size = 6,
  className = "",
  fillColor = "text-amber-400", // Màu sao đã chọn
  emptyColor = "text-gray-300"  // Màu sao chưa chọn
}: {
  rating: number
  size?: SizeKey
  className?: string
  fillColor?: string
  emptyColor?: string
}) {
  // Đảm bảo rating nằm trong khoảng hợp lệ 0-5
  const safeRating = Math.max(0, Math.min(5, rating));
  
  // Tính toán số lượng ngôi sao
  const fullStars = Math.floor(safeRating);
  const partialStar = safeRating % 1;
  const emptyStars = 5 - Math.ceil(safeRating);
  
  // Lấy class kích thước từ map
  const sizeClass = sizeClassMap[size];
  
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      aria-label={`Rating: ${safeRating.toFixed(1)} out of 5 stars`}
    >
      {/* Sao đầy */}
      {Array.from({ length: fullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className={`${sizeClass} fill-amber-400 ${fillColor} stroke-[1.5px]`}
        />
      ))}
      
      {/* Sao một phần */}
      {partialStar > 0 && (
        <div className="relative">
          <Star className={`${sizeClass} ${emptyColor} stroke-[1.5px]`} />
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${partialStar * 100}%` }}
          >
            <Star className={`${sizeClass} fill-amber-400 ${fillColor} stroke-[1.5px]`} />
          </div>
        </div>
      )}
      
      {/* Sao trống */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star
          key={`empty-${i}`}
          className={`${sizeClass} ${emptyColor} stroke-[1.5px]`}
        />
      ))}
    </div>
  )
}