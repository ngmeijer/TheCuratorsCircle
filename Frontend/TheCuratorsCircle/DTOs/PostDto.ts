export interface PostDto {
    id: string;
    userId: string;
    title: string;
    caption: string;
    mediaType: string;
    mediaId: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    shareCount: number;
}

export interface PostWithProfileDto {
    post: PostDto;
    profile: {
        persistentId: string;
        ownerUid: string;
        usernamesHistory: string[];
        displayName: string;
        bio: string;
    } | null;
}
