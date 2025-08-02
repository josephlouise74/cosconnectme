import { z } from 'zod'
// Removed unused import to fix lint error
// import { ProductCategory } from '@/types/productType'

// Define the filter form schema with Zod
export const filterFormSchema = z.object({
  search: z.string(),
  category: z.union([
    z.literal(''),
    z.enum([
      'anime_manga',
      'video_games',
      'movies_tv',
      'comics',
      'traditional',
      'original',
      'vtubers',
      'kpop_jpop'
    ])
  ]),
  priceRange: z.tuple([
    z.number().min(0),
    z.number().min(0)
  ]),
  tags: z.array(z.string()),
  gender: z.union([
    z.literal(''),
    z.enum(['male', 'female', 'unisex'])
  ]),
  sizes: z.array(z.string()),
  color: z.string(),
  sort: z.enum([
    'newest',
    'price-low',
    'price-high',
    'popular'
  ]),
  deliveryOptions: z.array(z.enum(['pickup', 'delivery']))
})

// Infer the type from the schema
export type FilterFormValues = z.infer<typeof filterFormSchema>
