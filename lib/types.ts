export type PromptAnswer = {
  question: string;
  answer: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  age_range: string | null;
  interests: string[] | null;
  instagram_handle: string | null;
  profile_photo_url: string | null;
  is_admin: boolean;
  onboarding_complete: boolean;
  age: number | null;
  desired_destinations: string[] | null;
  prompts: PromptAnswer[] | null;
  travel_style: string | null;
  languages: string[] | null;
  travel_frequency: string | null;
  verification_status: "pending" | "verified" | "declined";
  created_at: string;
};

export type Trip = {
  id: string;
  name: string;
  slug: string;
  dates: string;
  location: string;
  description: string;
  whats_included: string | null;
  price: string;
  spots_total: number;
  spots_left: number;
  hero_image_url: string;
  itinerary_url: string;
  booking_url: string;
  is_active: boolean;
};

export type TripMember = {
  id: string;
  trip_id: string;
  user_id: string;
  joined_at: string;
};

export type FriendRequest = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

export type Friendship = {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type TripMessage = {
  id: string;
  trip_id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};
