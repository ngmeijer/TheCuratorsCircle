export interface MediaSearchResult {
    id: string;
    title: string;
    year: string;
    type: string;
    posterUrl: string;
    plot?: string;
    genre?: string;
    rating?: number;
}