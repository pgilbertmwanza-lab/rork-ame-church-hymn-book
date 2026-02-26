export interface HymnCategory {
  name: string;
  icon: string;
  color: string;
}

export const BROWSE_CATEGORIES: HymnCategory[] = [
  { name: "Benediction", icon: "Sparkles", color: "#E31B23" },
  { name: "Heaven", icon: "Cloud", color: "#D97D20" },
  { name: "Praise & Worship", icon: "Music", color: "#6366F1" },
  { name: "Prayer & Devotion", icon: "HandMetal", color: "#10B981" },
  { name: "Faith & Trust", icon: "Shield", color: "#3B82F6" },
  { name: "Communion", icon: "Wine", color: "#8B5CF6" },
  { name: "Christmas", icon: "Star", color: "#F59E0B" },
  { name: "Easter/Resurrection", icon: "Sun", color: "#EC4899" },
  { name: "Comfort", icon: "Heart", color: "#EF4444" },
  { name: "Holy Spirit", icon: "Flame", color: "#F97316" },
  { name: "Salvation", icon: "Cross", color: "#14B8A6" },
  { name: "Mission", icon: "Globe", color: "#0EA5E9" },
];
