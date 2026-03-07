export interface UserProfileDto {
    persistentId: string;
    ownerUid: string;
    usernamesHistory: string[];
    displayName: string;
    bio: string;
    isPublic: boolean;
    createdAt: any;
    updatedAt: any;
}

export interface CreateUserProfileRequest {
    username: string;
    displayName?: string;
    bio?: string;
}
