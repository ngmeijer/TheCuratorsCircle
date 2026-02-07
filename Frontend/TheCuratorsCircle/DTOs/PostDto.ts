import {Movie} from "@/DTOs/CollectionDto";

export interface PostDto {
    id: string;
    name: string;
    movieData: Movie;
    title: string;
    category: string;
    aspectRatio: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
}
