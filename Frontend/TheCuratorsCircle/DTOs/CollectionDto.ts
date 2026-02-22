export interface Media {
    id: string;
    title: string;
    genre: string;
    plot: string;
    posterUrl: string;
    releaseYear: string;
    releaseDate: string;
    runtimeInMinutes: string;
    language: string;
    rating: number;
    director?: string;
    actors?: string;
    writer?: string;
    rated?: string;
    country?: string;
    awards?: string;
    boxOffice?: string;
    metascore?: string;
    imdbVotes?: string;
    mediaType?: string;
    totalSeasons?: string;
}

export interface CollectionDto {
    id: string;
    name: string;
    category: string;
    mediaData: Media[];
}
