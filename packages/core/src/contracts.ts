export type CreatorDto = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  category: string;
  bio: string;
  city: string;
  verified: boolean;
  isFree: boolean;
  monthlyPriceCents: number;
  subscriberCount: number;
  postCount: number;
  likeCount: number;
  fictitious: boolean;
  aiGenerated: boolean;
};

export type PostDto = {
  id: string;
  creatorId: string;
  mediaUrl: string;
  caption: string;
  visibility: "free" | "subscriber" | "ppv";
  mediaType: "image" | "video";
  priceCents?: number;
  likeCount: number;
  publishedAtLabel: string;
  demo: boolean;
};

export type ConversationDto = {
  id: string;
  creatorId: string;
  preview: string;
  timeLabel: string;
  unreadCount: number;
};

export type DiscoveryQuery = {
  search?: string;
  category?: string;
  cursor?: string;
  limit?: number;
};

export type Paginated<T> = {
  items: T[];
  nextCursor: string | null;
};

export type ReviewDto = {
  id: string;
  creatorId: string;
  authorName: string;
  rating: number;
  body: string;
  subscriber: boolean;
};

export type CommentDto = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
};

export interface MimeluxGateway {
  listCreators(query?: DiscoveryQuery): Promise<Paginated<CreatorDto>>;
  getCreator(username: string): Promise<CreatorDto | null>;
  listFeed(cursor?: string): Promise<Paginated<PostDto>>;
  listConversations(): Promise<ConversationDto[]>;
  listReviews(creatorId: string): Promise<ReviewDto[]>;
  listComments(postId: string): Promise<CommentDto[]>;
  simulateSubscription(creatorId: string, planId: string): Promise<void>;
  simulatePurchase(contentId: string): Promise<void>;
}
