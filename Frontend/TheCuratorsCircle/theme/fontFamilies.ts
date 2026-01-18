// theme/fontFamilies.ts
export const FontFamilies = {
    inter: {
        regular: 'Inter-Regular',
        medium: 'Inter-Medium',
        semibold: 'Inter-SemiBold',
        bold: 'Inter-Bold',
    },
    spartan: {
        bold: 'LeagueSpartan-Bold',
        semibold: 'LeagueSpartan-SemiBold',
    },
} as const;

export type FontFamilyName = keyof typeof FontFamilies;
