import { Data, IProductInput, IUserInput } from '@/types'
import { toSlug } from './utils'
import bcrypt from 'bcryptjs'
import { i18n } from '../../i18n-config'

const users: IUserInput[] = [
  {
    name: 'John',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'Admin',
    firebaseUid: '',
    image: '',
    isBlocked: false,
    address: {
      fullName: 'John Doe',
      street: '111 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '10001',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Stripe',
    emailVerified: false,
  },
  {
    name: 'Jane',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 5),
    role: 'User',
    firebaseUid: '1234567890',
    image: 'https://example.com/jane.jpg',
    phone   : 1234567890,
    isBlocked: false,
    address: {
      fullName: 'Jane Harris',
      street: '222 Main St',
      city: 'New York',
      province: 'NY',
      postalCode: '1002',
      country: 'USA',
      phone: '123-456-7890',
    },
    paymentMethod: 'Cash On Delivery',
    emailVerified: false,
  },
]
const products: IProductInput[] = [
  // T-Shirts
  {
    name: 'Local Brand Unisex Teelab Academy LongSleeve Tshirt TS292',
    slug: toSlug('Local Brand Unisex Teelab Academy LongSleeve Tshirt TS292'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749205997099-chtxa6.jpg?alt=media&token=a847099d-c675-437d-af17-1d8fc49133aa'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 21.8,
    listPrice: 30,
    brand: 'Teelab',
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    numSales: 9,
    countInStock: 15,
    description: 'Made with chemicals safer for human health and the environment',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Dark Gray', 'Black', 'White', 'Gray'],
    reviews: [],
  },
  {
    name: 'Teelab Local Brand Unisex Youthful JourneyTshirt TS245',
    slug: toSlug('Teelab Local Brand Unisex Youthful JourneyTshirt TS245'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749206209140-p589o1.webp?alt=media&token=04a10c48-3fab-4f4a-be55-643e98b19dec'],
    tags: ['featured'],
    isPublished: true,
    price: 23.78,
    listPrice: 0,
    brand: 'Teelab',
    avgRating: 4.2,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 29,
    countInStock: 12,
    description: 'Made with sustainably sourced USA grown cotton; Shoulder-to-shoulder tape; double-needle coverstitched front neck; Set-in sleeves; Rib cuffs with concealed seams; Seamless body for a wide printing area',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cream', 'Black'],
    reviews: [],
  },
  {
    name: 'Teelab Local Brand Unisex Hà Nội Trà Đá TS001',
    slug: toSlug('Teelab Local Brand Unisex Hà Nội Trà Đá TS001'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749206357198-bc3glf.webp?alt=media&token=2c2aea0c-af09-4cf0-8a0d-8b3e0a7ff186'],
    tags: ['best-seller'],
    isPublished: true,
    price: 13.86,
    listPrice: 16.03,
    brand: 'Teelab',
    avgRating: 4,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 2 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 55,
    countInStock: 55,
    description: 'The Jerzees long sleeve t-shirt is made with dri-power technology that wicks away moisture to keep you cool and dry throughout your day. We also included a rib collar and cuffs for added durability, and a lay-flat collar for comfort. If you are looking for a versatile shirt that you can wear throughout the transitioning seasons, then look no further.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black'],
    reviews: [],
  },
  {
    name: 'AA RACING LOGO TEE',
    slug: toSlug('AA RACING LOGO TEE'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749207308773-xn9cvz.webp?alt=media&token=f2084b36-7293-4e0f-8a0b-0dd64de7f9b9'],
    tags: ['todays-deal'],
    isPublished: true,
    price: 26.95,
    listPrice: 46.03,
    brand: 'Aatsu',
    avgRating: 3.85,
    numReviews: 14,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 54,
    countInStock: 132,
    description: 'Elevate your outfit with this soft long sleeve t shirt men. This full sleeves tee is the ultimate upgrade from your regular cotton t-shirt.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy'],
    reviews: [],
  },
  {
    name: 'Teelab Local Brand Unisex Struck by Cupid Tshirt TS273',
    slug: toSlug('Teelab Local Brand Unisex Struck by Cupid Tshirt TS273'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fteelab-local-brand-unisex-struck-by-cupid-tshirt-ts273%2Fmain%2F1749140241714-ohis48.webp?alt=media&token=c9af586e-cdac-48cc-8dfd-e97dd476b22b'],
    tags: ['new-arrival', 'featured'],
    isPublished: true,
    price: 29.99,
    listPrice: 35.99,
    brand: 'Teelab',
    avgRating: 3.66,
    numReviews: 15,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 5 },
    ],
    numSales: 54,
    countInStock: 3,
    description: "Slim Fit Design:Men's Muscle Slim Fit Button Henley Shirts are designed to fit snugly against your body, accentuating your muscles and creating a sleek silhouette that's perfect for any occasion.",
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown'],
    reviews: [],
  },
  {
    name: 'Wash Local Brand Unisex Teelab Rodeos Tshirt',
    slug: toSlug('Wash Local Brand Unisex Teelab Rodeos Tshirt'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fwash-local-brand-unisex-teelab-rodeos-tshirt%2Fmain%2F1749139983985-jh4jqc.webp?alt=media&token=09b8c811-c946-40c9-af7c-a66b5ecd15d5'],
    tags: ['best-seller', 'todays-deal'],
    isPublished: true,
    price: 25.3,
    listPrice: 32.99,
    brand: 'Teelab',
    avgRating: 3.46,
    numReviews: 13,
    ratingDistribution: [
      { rating: 1, count: 1 },
      { rating: 2, count: 2 },
      { rating: 3, count: 3 },
      { rating: 4, count: 4 },
      { rating: 5, count: 3 },
    ],
    numSales: 56,
    countInStock: 31,
    description: 'You will never be younger than you are at this very moment “Enjoy Your Youth!”\nHeavyweight cotton (Heathers are 60% cotton/40% polyester; Pebblestone is 75% cotton/25% polyester)',
    sizes: ['M', 'L', 'XL'],
    colors: ['Brown', 'Gray'],
    reviews: [],
  },
  {
    name: 'Local Brand Unisex Teelab Striped Tshirt TS328',
    slug: toSlug('Local Brand Unisex Teelab Striped Tshirt TS328'),
    category: 'T-Shirts',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749205701126-wvclwe.jpg?alt=media&token=d7f01aff-aefd-43c5-87c8-4e349ae91991'],
    tags: ['new arrival'],
    isPublished: true,
    price: 15,
    listPrice: 0,
    brand: 'Teelab',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 8,
    description: 'This is a sample description of the product.',
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    reviews: [],
  },
  // Jeans
  {
    name: 'Jean Local Brand Otis Club',
    slug: toSlug('Jean Local Brand Otis Club'),
    category: 'Jeans',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749212837562-jvanav.webp?alt=media&token=539930af-7e4a-4b13-918d-0082b43c1036'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 95.34,
    listPrice: 0,
    brand: 'Otis Club',
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    numSales: 21,
    countInStock: 12,
    description: 'Silver Jeans Co. Jace Slim Fit Bootcut Jeans - Consider Jace a modern cowboy jean. It sits below the waist and features a slim fit through the hip and thigh. Finished with an 18” bootcut leg opening that complements the slimmer silhouette while still fitting over boots',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black / Gray'],
    reviews: [],
  },
  {
    name: 'Jean Teelab Local Brand Unisex Basic Denim GP008',
    slug: toSlug('Jean Teelab Local Brand Unisex Basic Denim GP008'),
    category: 'Jeans',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fsample-product%2Fmain%2F1749203387577-sjggg4.webp?alt=media&token=549988a9-b87a-4eff-b94a-6c55c207ffd1'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 45,
    listPrice: 0,
    brand: 'Sample Brand',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 28,
    description: 'This is a sample description of the product.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Brown'],
    reviews: [],
  },
  // Watches
  {
    name: 'Toil Watch',
    slug: toSlug('Toil Watch'),
    category: 'Watches',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749206582699-b3ov6k.jpg?alt=media&token=1b95e268-a5f8-4117-a8a8-6fb4b76c2f26'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 26,
    listPrice: 51,
    brand: 'Seiko',
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    numSales: 48,
    countInStock: 0,
    description: 'Casing: Case made of stainless steel Case shape: round Case colour: silver Glass: Hardlex Clasp type: Fold over clasp with safety',
    sizes: ['20MM'],
    colors: ['Blue Navy'],
    reviews: [],
  },
  {
    name: 'Shift Curnon Watch',
    slug: toSlug('Shift Curnon Watch'),
    category: 'Watches',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749206769141-s9ft3f.jpg?alt=media&token=32dca384-e400-4daf-aaa4-22a97185e712'],
    tags: ['new arrival'],
    isPublished: true,
    price: 30,
    listPrice: 0,
    brand: 'Curnon',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 30,
    description: 'This is a sample description of the product.',
    sizes: ['20MM'],
    colors: ['Navy'],
    reviews: [],
  },
  {
    name: 'Aspire Curnon Watch',
    slug: toSlug('Aspire Curnon Watch'),
    category: 'Watches',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749207000649-667sln.png?alt=media&token=aa4f85de-9af7-4032-bb16-2258ea1891fc'],
    tags: ['new arrival', 'todays-deal'],
    isPublished: true,
    price: 20,
    listPrice: 0,
    brand: 'Curnon',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 34,
    description: 'This is a sample description of the product.',
    sizes: ['Base'],
    colors: ['Base'],
    reviews: [],
  },
  // Shoes
  {
    name: 'Adizero EVO SL Men',
    slug: toSlug('Adizero EVO SL Men'),
    category: 'Shoes',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fadizero-evo-sl-men%2Fmain%2F1749134566692-k4acwp.avif?alt=media&token=cce44922-ea52-4c17-98d9-f2542ba58f55'],
    tags: ['new-arrival'],
    isPublished: true,
    price: 81.99,
    listPrice: 0,
    brand: 'adidas',
    avgRating: 4.71,
    numReviews: 7,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 5 },
    ],
    numSales: 48,
    countInStock: 35,
    description: 'Speed-inspired shoes designed for fast culture.\nExperience the feeling of fast in the Adizero Evo SL. Inspired by the innovation of record-breaking shoes in the Adizero running family - and specifically the Pro Evo 1 - the Evo SL is designed for you to run in it, or not. Combining Adizero technology with a bold and unique racing-inspired aesthetic, it\'s an evolution of speed in all aspects of life. A responsive layer of LIGHTSTRIKE PRO foam in the midsole provides comfort and cushioning for optimal energy return.',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['White'],
    reviews: [],
  },
  {
    name: 'Men\'s Adidas Grand Court 2.0 Sneakers',
    slug: toSlug('Men\'s Adidas Grand Court 2.0 Sneakers'),
    category: 'Shoes',
    images: [
      'https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmens-adidas-grand-court-20-sneakers%2Fmain%2F1749131826509-b5i247.webp?alt=media&token=e454baba-a234-49be-849c-f8c106f7e9cf',
      'https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmens-adidas-grand-court-20-sneakers%2Fmain%2F1749131830920-owubmn.webp?alt=media&token=cb1d7ce7-d0e9-4fc7-83f5-0570c51273c0'
    ],
    tags: ['new-arrival'],
    isPublished: true,
    price: 99.99,
    listPrice: 0,
    brand: 'Adidas',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 9,
    description: 'This is a sample description of the product.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: ['Blue', 'Green', 'White'],
    reviews: [],
  },
  {
    name: 'Daily 3.0 Shoes',
    slug: toSlug('Daily 3.0 Shoes'),
    category: 'Shoes',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749212296314-6i8lrl.avif?alt=media&token=c23fb566-1e37-4e6a-aeba-f8bce596a98d'],
    tags: ['new arrival', 'best-seller'],
    isPublished: true,
    price: 60,
    listPrice: 100,
    brand: 'Adidas',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 75,
    description: 'This is a sample description of the product.',
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['Core Black', 'Crew Navy', 'Gum', 'Bright Royal'],
    reviews: [],
  },
  // Polo
  {
    name: 'Polo Teelab Local Brand Unisex Football Vintage Polo Shirt AP053',
    slug: toSlug('Polo Teelab Local Brand Unisex Football Vintage Polo Shirt AP053'),
    category: 'Polo',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749204479423-4xosbe.webp?alt=media&token=db9a2cd6-a118-4fb3-b15f-0d5b29c30272'],
    tags: ['new arrival'],
    isPublished: true,
    price: 34,
    listPrice: 0,
    brand: 'Teelab',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 10,
    description: 'This is a sample description of the product.',
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'Pink'],
    reviews: [],
  },
  // Hoodie
  {
    name: 'Hoodie Local Brand Unisex Zipup Teelab Classic Zipper Hoodie HD119',
    slug: toSlug('Hoodie Local Brand Unisex Zipup Teelab Classic Zipper Hoodie HD119'),
    category: 'Hoodie',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749213307629-hatj51.webp?alt=media&token=6d18ec16-c6dd-4328-88da-8e836046c255'],
    tags: ['new arrival'],
    isPublished: true,
    price: 13,
    listPrice: 0,
    brand: 'Teelab',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 112,
    description: 'This is a sample description of the product.',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Gray'],
    reviews: [],
  },
  {
    name: 'Hoodie Teelab Local Brand Unisex Bunny Cake Hoodie HD107',
    slug: toSlug('Hoodie Teelab Local Brand Unisex Bunny Cake Hoodie HD107'),
    category: 'Hoodie',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749213547912-ft9zpl.webp?alt=media&token=4f36d788-1542-434a-b56c-c9b568a33f14'],
    tags: ['new arrival'],
    isPublished: true,
    price: 30,
    listPrice: 45,
    brand: 'Teelab',
    avgRating: 0,
    numReviews: 0,
    ratingDistribution: [],
    numSales: 0,
    countInStock: 114,
    description: 'This is a sample description of the product.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Gray'],
    reviews: [],
  },
  {
    name: 'Hoodie Local Brand Unisex Teelab Dino Christmas Hoodie HD098',
    slug: toSlug('Hoodie Local Brand Unisex Teelab Dino Christmas Hoodie HD098'),
    category: 'Hoodie',
    images: ['https://firebasestorage.googleapis.com/v0/b/shop-80e0c.appspot.com/o/products%2Fmain%2F1749218377118-jr40kv.webp?alt=media&token=fe45e012-8ecb-4c51-b9c8-4195b57c00df'],
    tags: ['new arrival'],
    isPublished: true,
    price: 23,
    listPrice: 45,
    brand: 'Teelab',
    avgRating: 5,
    numReviews: 1,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 1 },
    ],
    numSales: 0,
    countInStock: 15,
    description: 'This is a sample description of the product.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Gray'],
    reviews: [],
  }
]
const reviews = [
  {
    rating: 1,
    title: 'Poor quality',
    comment:
      'Very disappointed. The item broke after just a few uses. Not worth the money.',
  },
  {
    rating: 2,
    title: 'Disappointed',
    comment:
      "Not as expected. The material feels cheap, and it didn't fit well. Wouldn't buy again.",
  },
  {
    rating: 2,
    title: 'Needs improvement',
    comment:
      "It looks nice but doesn't perform as expected. Wouldn't recommend without upgrades.",
  },
  {
    rating: 3,
    title: 'not bad',
    comment:
      'This product is decent, the quality is good but it could use some improvements in the details.',
  },
  {
    rating: 3,
    title: 'Okay, not great',
    comment:
      'It works, but not as well as I hoped. Quality is average and lacks some finishing.',
  },
  {
    rating: 3,
    title: 'Good product',
    comment:
      'This product is amazing, I love it! The quality is top notch, the material is comfortable and breathable.',
  },
  {
    rating: 4,
    title: 'Pretty good',
    comment:
      "Solid product! Great value for the price, but there's room for minor improvements.",
  },
  {
    rating: 4,
    title: 'Very satisfied',
    comment:
      'Good product! High quality and worth the price. Would consider buying again.',
  },
  {
    rating: 4,
    title: 'Absolutely love it!',
    comment:
      'Perfect in every way! The quality, design, and comfort exceeded all my expectations.',
  },
  {
    rating: 4,
    title: 'Exceeded expectations!',
    comment:
      'Fantastic product! High quality, feels durable, and performs well. Highly recommend!',
  },
  {
    rating: 5,
    title: 'Perfect purchase!',
    comment:
      "Couldn't be happier with this product. The quality is excellent, and it works flawlessly!",
  },
  {
    rating: 5,
    title: 'Highly recommend',
    comment:
      "Amazing product! Worth every penny, great design, and feels premium. I'm very satisfied.",
  },
  {
    rating: 5,
    title: 'Just what I needed',
    comment:
      'Exactly as described! Quality exceeded my expectations, and it arrived quickly.',
  },
  {
    rating: 5,
    title: 'Excellent choice!',
    comment:
      'This product is outstanding! Everything about it feels top-notch, from material to functionality.',
  },
  {
    rating: 5,
    title: "Couldn't ask for more!",
    comment:
      "Love this product! It's durable, stylish, and works great. Would buy again without hesitation.",
  },
]



const data: Data = {
  users,
  headerMenus: [
    {
      name: "Today's Deal",
      href: '/search?tag=todays-deal',
    },
    {
      name: 'New Arrivals',
      href: '/search?tag=new-arrival',
    },
    {
      name: 'Featured Products',
      href: '/search?tag=featured',
    },
    {
      name: 'Best Sellers',
      href: '/search?tag=best-seller',
    },
    {
      name: 'Browsing History',
      href: '/#browsing-history',
    },
    {
      name: 'Customer Service',
      href: '/page/customer-service',
    },
    {
      name: 'About Us',
      href: '/page/about-us',
    },
    {
      name: 'Help',
      href: '/page/help',
    },
  ],
  carousels: [
    {
      title: 'Most Popular Shoes For Sale',
      buttonCaption: 'Shop Now',
      imageUrl: '/images/banner3.jpg',
      url: '/search?category=Shoes',
      isPublished: true,
    },
    {
      title: 'Best Sellers in T-Shirts',
      buttonCaption: 'Shop Now',
      imageUrl: '/images/banner1.jpg',
      url: '/search?category=T-Shirts',
      isPublished: true,
    },
    {
      title: 'Best Deals on Wrist Watches',
      buttonCaption: 'See More',
      imageUrl: '/images/banner2.jpg',
      url: '/search?category=Wrist Watches',
      isPublished: true,
    },
  ],
  products,
  reviews,
  webPages: [
    {
      title: 'About Us',
      slug: 'about-us',
      content: `Welcome to [Your Store Name], your trusted destination for quality products and exceptional service. Our journey began with a mission to bring you the best shopping experience by offering a wide range of products at competitive prices, all in one convenient platform.

At [Your Store Name], we prioritize customer satisfaction and innovation. Our team works tirelessly to curate a diverse selection of items, from everyday essentials to exclusive deals, ensuring there's something for everyone. We also strive to make your shopping experience seamless with fast shipping, secure payments, and excellent customer support.

As we continue to grow, our commitment to quality and service remains unwavering. Thank you for choosing [Your Store Name]—we look forward to being a part of your journey and delivering value every step of the way.`,
      isPublished: true,
    },
    {
      title: 'Contact Us',
      slug: 'contact-us',
      content: `We’re here to help! If you have any questions, concerns, or feedback, please don’t hesitate to reach out to us. Our team is ready to assist you and ensure you have the best shopping experience.

**Customer Support**
For inquiries about orders, products, or account-related issues, contact our customer support team:
- **Email:** support@example.com
- **Phone:** +1 (123) 456-7890
- **Live Chat:** Available on our website from 9 AM to 6 PM (Monday to Friday).

**Head Office**
For corporate or business-related inquiries, reach out to our headquarters:
- **Address:** 1234 E-Commerce St, Suite 567, Business City, BC 12345
- **Phone:** +1 (987) 654-3210

We look forward to assisting you! Your satisfaction is our priority.
`,
      isPublished: true,
    },
    {
      title: 'Help',
      slug: 'help',
      content: `Welcome to our Help Center! We're here to assist you with any questions or concerns you may have while shopping with us. Whether you need help with orders, account management, or product inquiries, this page provides all the information you need to navigate our platform with ease.

**Placing and Managing Orders**
Placing an order is simple and secure. Browse our product categories, add items to your cart, and proceed to checkout. Once your order is placed, you can track its status through your account under the "My Orders" section. If you need to modify or cancel your order, please contact us as soon as possible for assistance.

**Shipping and Returns**
We offer a variety of shipping options to suit your needs, including standard and express delivery. For detailed shipping costs and delivery timelines, visit our Shipping Policy page. If you're not satisfied with your purchase, our hassle-free return process allows you to initiate a return within the specified timeframe. Check our Returns Policy for more details.

**Account and Support**
Managing your account is easy. Log in to update your personal information, payment methods, and saved addresses. If you encounter any issues or need further assistance, our customer support team is available via email, live chat, or phone. Visit our Contact Us page for support hours and contact details.`,
      isPublished: true,
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `We value your privacy and are committed to protecting your personal information. This Privacy Notice explains how we collect, use, and share your data when you interact with our services. By using our platform, you consent to the practices described herein.

We collect data such as your name, email address, and payment details to provide you with tailored services and improve your experience. This information may also be used for marketing purposes, but only with your consent. Additionally, we may share your data with trusted third-party providers to facilitate transactions or deliver products.

Your data is safeguarded through robust security measures to prevent unauthorized access. However, you have the right to access, correct, or delete your personal information at any time. For inquiries or concerns regarding your privacy, please contact our support team.`,
      isPublished: true,
    },
    {
      title: 'Conditions of Use',
      slug: 'conditions-of-use',
      content: `Welcome to [Ecommerce Website Name]. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our platform, including browsing, purchasing products, and interacting with any content or services provided. You must be at least 18 years old or have the consent of a parent or guardian to use this website. Any breach of these terms may result in the termination of your access to our platform.

We strive to ensure all product descriptions, pricing, and availability information on our website are accurate. However, errors may occur, and we reserve the right to correct them without prior notice. All purchases are subject to our return and refund policy. By using our site, you acknowledge that your personal information will be processed according to our privacy policy, ensuring your data is handled securely and responsibly. Please review these terms carefully before proceeding with any transactions.
`,
      isPublished: true,
    },
    {
      title: 'Customer Service',
      slug: 'customer-service',
      content: `At [Your Store Name], our customer service team is here to ensure you have the best shopping experience. Whether you need assistance with orders, product details, or returns, we are committed to providing prompt and helpful support.

If you have questions or concerns, please reach out to us through our multiple contact options:
- **Email:** support@example.com
- **Phone:** +1 (123) 456-7890
- **Live Chat:** Available on our website for instant assistance

We also provide helpful resources such as order tracking, product guides, and FAQs to assist you with common inquiries. Your satisfaction is our priority, and we’re here to resolve any issues quickly and efficiently. Thank you for choosing us!`,
      isPublished: true,
    },
    {
      title: 'Returns Policy',
      slug: 'returns-policy',
      content: 'Returns Policy Content',
      isPublished: true,
    },
    {
      title: 'Careers',
      slug: 'careers',
      content: 'careers Content',
      isPublished: true,
    },
    {
      title: 'Blog',
      slug: 'blog',
      content: 'Blog Content',
      isPublished: true,
    },
    {
      title: 'Sell Products',
      slug: 'sell',
      content: `Sell Products Content`,
      isPublished: true,
    },
    {
      title: 'Become Affiliate',
      slug: 'become-affiliate',
      content: 'Become Affiliate Content',
      isPublished: true,
    },
    {
      title: 'Advertise Your Products',
      slug: 'advertise',
      content: 'Advertise Your Products',
      isPublished: true,
    },
    {
      title: 'Shipping Rates & Policies',
      slug: 'shipping',
      content: 'Shipping Rates & Policies',
      isPublished: true,
    },
  ],
  settings: [
    {
      common: {
        freeShippingMinPrice: 35,
        isMaintenanceMode: false,
        defaultTheme: 'Light',
        defaultColor: 'Blue',
        pageSize: 9,
      },
      site: {
        name: 'You&Me',
        description:
          'You&Me ,Together, we shop better, A cozy and modern shopping experience built for you and your loved ones. Ecommerce website built with Next.js, Tailwind CSS, Firebase, and MongoDB.',
        keywords: 'Next Ecommerce ,Next.js ,Tailwind CSS ,Firebase, MongoDB',
        url: 'https://ecommerce-2025-two.vercel.app',
        logo: '/icons/logo.svg',
        slogan: 'Spend less, enjoy more.',
        author: 'Next Ecommerce',
        copyright: '2000-2024, Next-Ecommerce.com, Inc. or its affiliates',
        email: 'admin@example.com',
        address: '123, Main Street, Anytown, CA, Zip 12345',
        phone: '+1 (123) 456-7890',
      },
      carousels: [
        {
          title: 'Most Popular Shoes For Sale',
          buttonCaption: 'Shop Now',
          image: '/images/banner3.jpg',
          url: '/search?category=Shoes',
        },
        {
          title: 'Best Sellers in T-Shirts',
          buttonCaption: 'Shop Now',
          image: '/images/banner1.jpg',
          url: '/search?category=T-Shirts',
        },
        {
          title: 'Best Deals on Wrist Watches',
          buttonCaption: 'See More',
          image: '/images/banner2.jpg',
          url: '/search?category=Wrist Watches',
        },
      ],
      availableLanguages: i18n.locales.map((locale) => ({
        code: locale.code,
        name: locale.name,
      })),
      defaultLanguage: 'en-US',
      availableCurrencies: [
        {
          name: 'United States Dollar',
          code: 'USD',
          symbol: '$',
          convertRate: 1,
        },
        { name: 'Euro', code: 'EUR', symbol: '€', convertRate: 0.96 },
        { name: 'UAE Dirham', code: 'AED', symbol: 'AED', convertRate: 3.67 },
      ],
      defaultCurrency: 'USD',
      availablePaymentMethods: [
        { name: 'PayPal', commission: 0 },
        { name: 'Stripe', commission: 0 },
        { name: 'Cash On Delivery', commission: 0 },
      ],
      defaultPaymentMethod: 'PayPal',
      availableDeliveryDates: [
        {
          name: 'Tomorrow',
          daysToDeliver: 1,
          shippingPrice: 12.9,
          freeShippingMinPrice: 0,
        },
        {
          name: 'Next 3 Days',
          daysToDeliver: 3,
          shippingPrice: 6.9,
          freeShippingMinPrice: 0,
        },
        {
          name: 'Next 5 Days',
          daysToDeliver: 5,
          shippingPrice: 4.9,
          freeShippingMinPrice: 35,
        },
      ],
      defaultDeliveryDate: 'Next 5 Days',
    },
  ],
  
}

export default data