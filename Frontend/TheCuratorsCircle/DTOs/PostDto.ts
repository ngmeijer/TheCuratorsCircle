import {Movie} from "@/DTOs/CollectionDto";

export interface PostDto {
    id: string;
    name: string;
    mediaData: Movie;
    createdAt: string;
    title: string;
    category: string;
    aspectRatio: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
}
