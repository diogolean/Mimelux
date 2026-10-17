export type Creator = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  cover: string;
  category: string;
  bio: string;
  city: string;
  verified: boolean;
  free: boolean;
  price: number;
  subscribers: number;
  posts: number;
  fictitious: true;
  aiGenerated: true;
};

export type Post = {
  id: string;
  creatorId: string;
  image: string;
  caption: string;
  visibility: "free" | "subscriber" | "ppv";
  mediaType: "image" | "video";
  price?: number;
  likes: number;
  time: string;
  demo: true;
};

const generatedPath = "/media/generated";

const creatorDefinitions = [
  ["luna-ferraz", "Luna Ferraz", "lunaferraz", "Lifestyle", "Lifestyle, café e pôr do sol em SP.", "São Paulo, SP"],
  ["bella-monroe", "Bella Monroe", "bellamonroe", "Moda", "Moda autoral e looks do dia.", "Londres · São Paulo"],
  ["nina-valenca", "Nina Valença", "ninavalenca", "Beleza", "Skincare e maquiagem natural.", "Rio de Janeiro, RJ"],
  ["sofia-blake", "Sofia Blake", "sofiablake", "Fitness", "Treinos e bem-estar diário.", "Miami · Brasília"],
  ["clara-duarte", "Clara Duarte", "claraduarte", "Viagem", "Viagens e roteiros secretos.", "Lisboa · Florianópolis"],
  ["mia-castell", "Mia Castell", "miacastell", "Música", "Música acústica e bastidores.", "Buenos Aires · Curitiba"],
  ["aiko-lume", "Aiko Lume", "aikolume", "Moda", "Minimalismo e moda urbana.", "Tóquio · São Paulo"],
  ["valentina-rios", "Valentina Rios", "valentinarios", "Fitness", "Pilates e alimentação leve.", "Belo Horizonte, MG"],
  ["zara-monteiro", "Zara Monteiro", "zaramonteiro", "Beleza", "Beleza, cabelo e autoestima.", "Salvador, BA"],
  ["elena-vidal", "Elena Vidal", "elenavidal", "Lifestyle", "Rotina slow e decoração.", "Porto Alegre, RS"],
  ["isis-amaral", "Isis Amaral", "isisamaral", "Viagem", "Praias e aventuras pelo Brasil.", "Recife, PE"],
  ["grace-halden", "Grace Halden", "gracehalden", "Música", "Voz, piano e noites de jazz.", "Nova York · Rio"],
  ["lara-nakamura", "Lara Nakamura", "laranakamura", "Gastronomia", "Gastronomia e dicas de SP.", "São Paulo, SP"],
  ["maya-torres", "Maya Torres", "mayatorres", "Fitness", "Treino, praia e muita energia.", "Brasília, DF"],
  ["kiara-lopes", "Kiara Lopes", "kiaralopes", "Moda", "Moda ousada e looks de verão.", "Fortaleza, CE"],
  ["alana-reis", "Alana Reis", "alanareis", "Viagem", "Ilhas, barcos e pôr do sol.", "Florianópolis, SC"],
] as const;

export const creators: Creator[] = creatorDefinitions.map(
  ([id, name, username, category, bio, city], index) => ({
    id,
    name,
    username,
    avatar: `${generatedPath}/creator-${id}-avatar.jpg`,
    cover: `${generatedPath}/creator-${id}-cover.jpg`,
    category,
    bio,
    city,
    verified: index < 13,
    free: [2, 6, 10, 12].includes(index),
    price: [2990, 2490, 0, 1990, 2790, 1590, 0, 1890, 1490, 2290, 0, 1690, 0, 1790, 2190, 2590][index]!,
    subscribers: 21400 - index * 970,
    posts: 186 - index * 5,
    fictitious: true,
    aiGenerated: true,
  }),
);

const captions = [
  "Um pouco do meu dia, do jeito que ele aconteceu ✦",
  "Bastidores novos: ideias, erros bonitos e o resultado final.",
  "Separei algo especial para quem acompanha de perto.",
  "Minha seleção da semana chegou — qual é o seu favorito?",
  "O guia completo está por aqui, com todos os detalhes.",
  "Uma pausa, uma luz bonita e uma história para contar.",
  "Novo processo criativo: do primeiro rascunho à versão final.",
  "Respondendo às perguntas que vocês mais mandaram.",
  "Conteúdo inédito gravado hoje, sem cortes e sem pressa.",
  "Três descobertas que mudaram a minha rotina este mês.",
  "Esse momento merecia sair da galeria e vir para cá.",
  "Uma experiência criada especialmente para a comunidade.",
];

const publicPosts: Post[] = creators.slice(0, 12).map((creator, index) => ({
  id: `public-${creator.id}`,
  creatorId: creator.id,
  image: `${generatedPath}/post-${String(index + 1).padStart(2, "0")}.jpg`,
  caption: captions[index]!,
  visibility: "free",
  mediaType: "image",
  likes: 1240 + index * 317,
  time: index < 2 ? `há ${24 + index * 19} min` : `há ${index + 1} h`,
  demo: true,
}));

const subscriberPosts: Post[] = creators.flatMap((creator, creatorIndex) =>
  Array.from({ length: creatorIndex < 4 ? 2 : 1 }, (_, itemIndex) => {
    const assetIndex = ((creatorIndex + itemIndex + 3) % 12) + 1;
    return {
      id: `subscriber-${creator.id}-${itemIndex + 1}`,
      creatorId: creator.id,
      image: `${generatedPath}/post-${String(assetIndex).padStart(2, "0")}.jpg`,
      caption: captions[(creatorIndex + itemIndex + 4) % captions.length]!,
      visibility: itemIndex % 2 === 1 ? "ppv" as const : "subscriber" as const,
      price: itemIndex % 2 === 1 ? 1_990 + creatorIndex * 100 : undefined,
      mediaType: (creatorIndex + itemIndex) % 6 === 0 ? "video" as const : "image" as const,
      likes: 612 + ((creatorIndex * 487 + itemIndex * 173) % 4200),
      time: `há ${Math.ceil((creatorIndex + itemIndex + 3) / 3)} d`,
      demo: true as const,
    };
  }),
);

export const posts: Post[] = [...publicPosts, ...subscriberPosts];

export const conversations = creators.slice(0, 7).map((creator, index) => ({
  id: creator.id,
  creatorId: creator.id,
  preview: [
    "Separei um conteúdo especial pra você ✨",
    "O que achou da seleção de hoje?",
    "A lista completa está aqui!",
    "Ouviu a demo nova?",
    "Cheguei em um lugar incrível.",
    "Obrigada por fazer parte 💛",
    "Tem novidade no feed!",
  ][index]!,
  time: ["15:13", "12:42", "ontem", "seg", "dom", "sex", "qui"][index]!,
  unread: [2, 0, 0, 1, 0, 3, 0][index]!,
}));

export const categories = [
  "Todos",
  "Lifestyle",
  "Fitness",
  "Música",
  "Gastronomia",
  "Moda",
  "Beleza",
  "Viagem",
] as const;

export const plans = [
  { id: "monthly", name: "Mensal", months: 1, discount: 0 },
  { id: "quarterly", name: "3 meses", months: 3, discount: 10 },
  { id: "semiannual", name: "6 meses", months: 6, discount: 20 },
  { id: "yearly", name: "12 meses", months: 12, discount: 30 },
] as const;

export const notifications = [
  { id: "n1", text: "Luna Ferraz publicou uma novidade.", read: false },
  { id: "n2", text: "Sua assinatura demo foi ativada.", read: true },
  { id: "n3", text: "Mia Castell enviou uma mensagem.", read: false },
] as const;

export const dashboardMetrics = {
  revenueCents: 184720,
  availableCents: 126400,
  subscribers: 1248,
  newSubscribers: 86,
  postViews: 38200,
  engagementRate: 8.7,
  monthlySeries: [38, 52, 47, 68, 72, 81, 93, 88, 104, 117, 122, 136],
} as const;

export const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export const compact = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
