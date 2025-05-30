import Stripe from "stripe";

export interface Song {
  id: string;
  user_id: string;
  author: string;
  title: string;
  song_path: string;
  image_path: string;
  album_id: string;
  created_at: string;
}

export interface SongWithLikes {
  song: {
    id: string;
    user_id: string;
    author: string;
    title: string;
    song_path: string;
    image_path: string;
    album_id: string;
    created_at: string;
  }
 like_count: number;
}

export interface Product {
  id: string;
  active?: boolean;
  name?: string;
  description?: string;
  image?: string;
  metadata?: Stripe.Metadata;
}

export interface Price {
  id: string;
  product_id?: string;
  active?: boolean;
  description?: string;
  unit_amount?: number;
  currency?: string;
  type?: Stripe.Price.Type;
  interval?: Stripe.Price.Recurring.Interval;
  interval_count?: number;
  trial_period_days?: number | null;
  metadata?: Stripe.Metadata;
  products?: Product;
}

export interface Customer {
  id: string;
  stripe_customer_id?: string;
}

export interface UserDetails {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  billing_address?: Stripe.Address;
  payment_method?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id:string,
  user_id: string,
  name: string,
  description: string,
  image_path: string,
  is_public: boolean,
}
export interface ProductWithPrice extends Product {
  prices?: Price[];
}

export interface Subscription {
  id: string;
  user_id: string;
  status?: Stripe.Subscription.Status;
  metadata?: Stripe.Metadata;
  price_id?: string;
  quantity?: number;
  cancel_at_period_end?: boolean;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at?: string;
  cancel_at?: string;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
  prices?: Price;
}
export interface Album {
  id: string;
  user_id: string;
  name: string;
  author: string;
  ispublic: boolean;
  image_path: string;
}

export interface Followers {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  target_id: string;
  sent_id: string;
  song_id: string;
  message: string;
  created_at: string;
  deleted_at?: string | null;
}