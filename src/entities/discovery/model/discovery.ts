export type DiscoveryItem = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export const discoveryItems: DiscoveryItem[] = [
  {
    id: "d_1",
    title: "Explore Alpha",
    description: "First discovery item",
    category: "Recommended",
  },
  { id: "d_2", title: "Explore Beta", description: "Second discovery item", category: "Popular" },
  { id: "d_3", title: "Explore Gamma", description: "Third discovery item", category: "New" },
  {
    id: "d_4",
    title: "Explore Delta",
    description: "Fourth discovery item",
    category: "Recommended",
  },
  { id: "d_5", title: "Explore Epsilon", description: "Fifth discovery item", category: "Popular" },
  { id: "d_6", title: "Explore Zeta", description: "Sixth discovery item", category: "New" },
  {
    id: "d_7",
    title: "Explore Eta",
    description: "Seventh discovery item",
    category: "Recommended",
  },
  { id: "d_8", title: "Explore Theta", description: "Eighth discovery item", category: "Popular" },
  { id: "d_9", title: "Explore Iota", description: "Ninth discovery item", category: "New" },
  {
    id: "d_10",
    title: "Explore Kappa",
    description: "Tenth discovery item",
    category: "Recommended",
  },
];

export function getDiscoveryItemById(id: string) {
  return discoveryItems.find((item) => item.id === id) ?? null;
}
