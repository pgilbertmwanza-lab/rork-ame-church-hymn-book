export interface Hymn {
  id: string;
  number: number;
  title: string;
  titleBemba?: string;
  lyrics?: string;
  lyricsBemba?: string;
  verses: string[];
  versesBemba?: string[];
  category?: string;
  author?: string;
}

export type FontSize = "small" | "medium" | "large" | "xlarge";

export const TEXT_SCALE_FACTORS: Record<FontSize, number> = {
  small: 0.85,
  medium: 1.0,
  large: 1.2,
  xlarge: 1.4,
};
