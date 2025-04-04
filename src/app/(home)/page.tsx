'use client';

import { useCategories, useProducts, useProductsByTag } from '@/hooks';
import { HomeCard } from '@/components/shared/home/homeCard';
import { HomeCarousel } from '@/components/shared/home/homeCarousel';
import data from '@/lib/data';
import { toSlug } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import ProductSlider from '@/components/shared/product/productSlider';


export default function HomePage() {
  // Gọi API bằng hooks
  const { categories } = useCategories(4);
  const { products: newArrivals } = useProducts('new-arrival', 4);
  const { products: featureds } = useProducts('featured', 4);
  const { products: bestSellers } = useProducts('best-seller', 4);
  const { products: todaysDeals } = useProductsByTag('todays-deals');
  const { products: bestSellingProducts } = useProductsByTag('best-seller');

  // Tạo dữ liệu cho cards
  const cards = [
    {
      title: 'Categories to explore',
      link: {
        text: 'See More',
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: 'Explore New Arrivals',
      items: newArrivals,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Discover Best Sellers',
      items: bestSellers,
      link: {
        text: 'View All',
        href: '/search?tag=best-seller',
      },
    },
    {
      title: 'Featured Products',
      items: featureds,
      link: {
        text: 'Shop Now',
        href: '/search?tag=featured',
      },
    },
  ];

  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className="md:p-4 md:space-y-4 bg-border">
        <HomeCard cards={cards} />

        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider title={"Today's Deals"} products={todaysDeals} />
          </CardContent>
        </Card>

        <Card className='w-full rounded-none'>
    <CardContent className='p-4 items-center gap-3'>
      <ProductSlider
        title='Best Selling Products'
        products={bestSellingProducts}
        hideDetails
      />
    </CardContent>
  </Card>

      </div>
    </>
  );
}