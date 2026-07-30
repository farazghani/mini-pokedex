export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  stats: Record<string, number>;
  spriteUrl: string;
}