export interface PostDto {
    id: string;
    userId?: string;
    title?: string;
    caption?: string;
    mediaType?: string;
    mediaId?: string;
    createdAt?: string;
    likeCount?: number;
    commentCount?: number;
    shareCount?: number;
}
