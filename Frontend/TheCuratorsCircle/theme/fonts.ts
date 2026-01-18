// theme/fonts.ts
import { FontFamilies } from './fontFamilies';

export const Fonts = {
    body: FontFamilies.inter.regular,
    bodyMedium: FontFamilies.inter.medium,
    bodyStrong: FontFamilies.inter.semibold,

    heading: FontFamilies.inter.semibold,
    headingStrong: FontFamilies.inter.bold,

    brand: FontFamilies.spartan.bold,
} as const;
