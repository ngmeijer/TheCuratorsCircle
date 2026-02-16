export interface Movie {
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
}

export interface CollectionDto {
    id: string;
    name: string;
    category: string;
    moviesData: Movie[];
}
