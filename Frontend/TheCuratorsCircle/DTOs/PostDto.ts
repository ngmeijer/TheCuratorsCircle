import {Media} from "@/DTOs/CollectionDto";

export interface PostDto {
    id: string;
    name: string;
    mediaData: Media;
    createdAt: string;
    title: string;
    category: string;
    aspectRatio: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
}
