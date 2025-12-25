
import { Product, BlogPost } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Organic Moringa Powder (250g)',
    price: 399,
    category: 'Pure Moringa Leaf Powder',
    description: 'Our signature 100% Organic sun-dried Moringa Oleifera leaf powder. This pure moringa powder acts as a natural immunity booster powder and superfood powder. Perfect for weight management, digestion support, and skin-hair wellness. An essential ayurvedic moringa powder for your daily wellness journey.',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    reviews: 128,
    benefits: ['Natural Energy Powder', 'Immunity Booster Powder', 'Digestion Support Powder', 'Skin Hair Wellness'],
    nutrition: [{ label: 'Protein', value: '8.5g' }, { label: 'Iron', value: '15%' }, { label: 'Vitamin A', value: '12%' }],
    ingredients: '100% Organic Pure Moringa Leaf Powder'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: 'The Miracle Tree: Why Organic Moringa Powder?',
    excerpt: 'Discover why our pure moringa leaf powder is considered the ultimate herbal health supplement and natural energy booster.',
    date: 'Oct 12, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&q=80&w=800',
    content: 'Moringa Oleifera has been used for centuries as an ayurvedic moringa powder...'
  },
  {
    id: 'b2',
    title: '5 Ways to Use Superfood Powder in Recipes',
    excerpt: 'From smoothies to savory dishes, learn how to easily incorporate this organic health supplement into your daily wellness routine.',
    date: 'Nov 04, 2023',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1623910398328-98e3b3b4f627?auto=format&fit=crop&q=80&w=800',
    content: 'Adding natural moringa powder to your daily routine is easier than you think...'
  }
];
