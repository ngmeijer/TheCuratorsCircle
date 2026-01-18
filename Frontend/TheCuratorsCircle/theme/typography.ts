// theme/typography.ts
import { Fonts } from './fonts';

export const Typography = {
    body: {
        fontFamily: Fonts.body,
        fontSize: 16,
        lineHeight: 24,
    },
    heading: {
        fontFamily: Fonts.headingStrong,
        fontSize: 24,
        lineHeight: 32,
    },
    brandTitle: {
        fontFamily: Fonts.brand,
        fontSize: 32,
        letterSpacing: 1,
    },
} as const;
