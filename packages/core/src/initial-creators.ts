export type InitialMarket = "US" | "DE" | "FR" | "BR";

export type InitialCreator = {
  slug: string;
  displayName: string;
  market: InitialMarket;
  count: number;
  city: string;
  category: string;
  bio: string;
  monthlyPriceCents: number;
  followers: number;
  subscribers: number;
  captions: readonly string[];
};

export const initialCreators: readonly InitialCreator[] = [
  {
    slug: "albina-schneider",
    displayName: "Albina Schneider",
    market: "DE",
    count: 18,
    city: "Berlin",
    category: "Lifestyle",
    bio: "Alltag in Berlin, Kaffee und kleine Ausflüge am Wochenende.",
    monthlyPriceCents: 1490,
    followers: 2400,
    subscribers: 72,
    captions: [
      "Kaffee vor dem ersten Termin.",
      "Ein kurzer Spaziergang nach der Arbeit.",
      "Licht am Fenster, ganz ruhig.",
      "Wochenende ohne Plan.",
    ],
  },
  {
    slug: "amanda-ribeiro",
    displayName: "Amanda Ribeiro",
    market: "BR",
    count: 135,
    city: "São Paulo, SP",
    category: "Lifestyle",
    bio: "Rotina em São Paulo, café e um pouco de sol no fim do dia.",
    monthlyPriceCents: 3990,
    followers: 9800,
    subscribers: 240,
    captions: [
      "Café passado e a rua ainda quieta.",
      "Um canto de sol na sala.",
      "Look simples para sair sem pressa.",
      "Fim de tarde na janela.",
    ],
  },
  {
    slug: "ericka-hoffmann",
    displayName: "Ericka Hoffmann",
    market: "DE",
    count: 61,
    city: "München",
    category: "Fitness",
    bio: "Training, frische Luft und einfache Routinen aus München.",
    monthlyPriceCents: 1290,
    followers: 5100,
    subscribers: 118,
    captions: [
      "Kurze Runde vor der Arbeit.",
      "Dehnen am Abend.",
      "Wasser, Schuhe, los.",
      "Ruhiger Sonntag im Park.",
    ],
  },
  {
    slug: "francesca-dubois",
    displayName: "Francesca Dubois",
    market: "FR",
    count: 47,
    city: "Lyon",
    category: "Moda",
    bio: "Tenues du jour et coulisses tranquilles, depuis Lyon.",
    monthlyPriceCents: 1690,
    followers: 4300,
    subscribers: 96,
    captions: [
      "La veste de la semaine.",
      "Détail du matin, avant de sortir.",
      "Une couleur douce pour aujourd'hui.",
      "Retour de cours, lumière basse.",
    ],
  },
  {
    slug: "roberta-rose",
    displayName: "Roberta Rose",
    market: "US",
    count: 90,
    city: "Austin",
    category: "Lifestyle",
    bio: "City walks, coffee, and a slower weekend.",
    monthlyPriceCents: 1990,
    followers: 11200,
    subscribers: 310,
    captions: [
      "Coffee before the heat picks up.",
      "A short walk between errands.",
      "Late light on the porch.",
      "Nothing planned, which is the point.",
    ],
  },
  {
    slug: "sarah-mitchell",
    displayName: "Sarah Mitchell",
    market: "US",
    count: 61,
    city: "Chicago",
    category: "Beleza",
    bio: "Skincare notes and quiet mornings in Chicago.",
    monthlyPriceCents: 1490,
    followers: 7600,
    subscribers: 154,
    captions: [
      "Morning light, no rush.",
      "The routine that actually stuck.",
      "A simple look for a long day.",
      "Window light after work.",
    ],
  },
  {
    slug: "soraya-lefevre",
    displayName: "Soraya Lefèvre",
    market: "FR",
    count: 118,
    city: "Paris",
    category: "Moda",
    bio: "Lumière naturelle et tenues du quotidien à Paris.",
    monthlyPriceCents: 1790,
    followers: 8900,
    subscribers: 205,
    captions: [
      "La lumière de la fenêtre suffit.",
      "Une tenue pour traverser la ville.",
      "Détail du col, ce matin.",
      "Fin de journée, chaussures encore aux pieds.",
    ],
  },
  {
    slug: "stephanie-carter",
    displayName: "Stephanie Carter",
    market: "US",
    count: 59,
    city: "Portland",
    category: "Viagem",
    bio: "Short trips and photos from the road.",
    monthlyPriceCents: 990,
    followers: 1800,
    subscribers: 48,
    captions: [
      "Stop on the way north.",
      "Motel light, early checkout.",
      "A trail that stayed close to town.",
      "Window seat, no playlist.",
    ],
  },
  {
    slug: "taty-moreira",
    displayName: "Taty Moreira",
    market: "BR",
    count: 25,
    city: "Belo Horizonte, MG",
    category: "Lifestyle",
    bio: "Looks simples e a vida em Belo Horizonte, sem pressa.",
    monthlyPriceCents: 2490,
    followers: 960,
    subscribers: 27,
    captions: [
      "Blusa leve para o calor.",
      "Varanda no fim da tarde.",
      "Um café antes de sair.",
      "Rua quieta depois do almoço.",
    ],
  },
];

const launchCreatorAnchor = Date.UTC(2026, 9, 22, 12, 0, 0);
const launchPostAnchor = Date.UTC(2026, 9, 22, 18, 0, 0);
const demoCreatorAnchor = Date.UTC(2026, 0, 10, 12, 0, 0);
const demoPostAnchor = Date.UTC(2026, 0, 15, 12, 0, 0);

export function launchCreatorCreatedAt(index: number) {
  return new Date(launchCreatorAnchor - index * 60_000);
}

export function launchPostPublishedAt(creatorIndex: number, postIndex: number) {
  return new Date(launchPostAnchor - (creatorIndex * 10_000 + postIndex) * 1000);
}

export function demoCreatorCreatedAt(index: number) {
  return new Date(demoCreatorAnchor - index * 3_600_000);
}

export function demoPostPublishedAt(index: number) {
  return new Date(demoPostAnchor - index * 60_000);
}

export function imageFile(index: number) {
  return `${String(index).padStart(3, "0")}.jpg`;
}

export function modelMediaPath(slug: string, file: string) {
  return `/media/models/${slug}/${file}`;
}

export function postLikeCount(slug: string, index: number) {
  let hash = 0;
  for (const char of slug) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return 20 + ((hash + index * 47) % 881);
}

export type InitialPost = {
  id: string;
  slug: string;
  file: string;
  path: string;
  caption: string;
  free: boolean;
  likes: number;
};

export function initialPosts(creator: InitialCreator = initialCreators[0]!): InitialPost[] {
  const posts: InitialPost[] = [];
  for (let number = 3; number <= creator.count; number += 1) {
    const file = imageFile(number);
    const index = posts.length;
    posts.push({
      id: `${creator.slug}-${file.replace(".jpg", "")}`,
      slug: creator.slug,
      file,
      path: modelMediaPath(creator.slug, file),
      caption: creator.captions[index % creator.captions.length]!,
      free: index % 4 === 0,
      likes: postLikeCount(creator.slug, index),
    });
  }
  return posts;
}

export function initialCreatorPosts() {
  return initialCreators.flatMap((creator) => initialPosts(creator));
}
