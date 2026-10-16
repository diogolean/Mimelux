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
};

export type Post = {
  id: string;
  creatorId: string;
  image: string;
  caption: string;
  visibility: "free" | "subscriber" | "ppv";
  price?: number;
  likes: number;
  time: string;
};

export const creators: Creator[] = [
  {
    id: "marina",
    name: "Marina Luz",
    username: "marinaluz",
    avatar: "/media/avatars/marina.jpg",
    cover: "/media/covers/marina.jpg",
    category: "Viagem & lifestyle",
    bio: "Roteiros secretos, bastidores e uma vida com mais sol. Vem viajar comigo ✦",
    city: "Florianópolis, SC",
    verified: true,
    free: false,
    price: 2990,
    subscribers: 18400,
    posts: 184,
  },
  {
    id: "lucas",
    name: "Lucas Prado",
    username: "lucasprado",
    avatar: "/media/avatars/lucas.jpg",
    cover: "/media/covers/lucas.jpg",
    category: "Fitness",
    bio: "Treinos possíveis, rotina real e evolução sem atalhos.",
    city: "São Paulo, SP",
    verified: true,
    free: false,
    price: 1990,
    subscribers: 15100,
    posts: 142,
  },
  {
    id: "helena",
    name: "Helena Sato",
    username: "helenasato",
    avatar: "/media/avatars/helena.jpg",
    cover: "/media/covers/helena.jpg",
    category: "Gastronomia",
    bio: "Receitas afetivas, jantares especiais e o que não cabe no feed.",
    city: "Curitiba, PR",
    verified: true,
    free: true,
    price: 0,
    subscribers: 12700,
    posts: 96,
  },
  {
    id: "theo",
    name: "Theo Martins",
    username: "theomartins",
    avatar: "/media/avatars/theo.jpg",
    cover: "/media/covers/theo.jpg",
    category: "Música",
    bio: "Demos inéditas, sessões de estúdio e conversa sobre processo criativo.",
    city: "Rio de Janeiro, RJ",
    verified: true,
    free: false,
    price: 2490,
    subscribers: 9900,
    posts: 78,
  },
  {
    id: "sofia",
    name: "Sofia Nunes",
    username: "sofianunes",
    avatar: "/media/avatars/sofia.jpg",
    cover: "/media/covers/sofia.jpg",
    category: "Moda",
    bio: "Styling, garimpos e bastidores de editoriais.",
    city: "Belo Horizonte, MG",
    verified: true,
    free: false,
    price: 1590,
    subscribers: 8400,
    posts: 121,
  },
  {
    id: "caio",
    name: "Caio Velloso",
    username: "caiovelloso",
    avatar: "/media/avatars/caio.jpg",
    cover: "/media/covers/caio.jpg",
    category: "Café & rotina",
    bio: "Café bom, cidades bonitas e dias mais lentos.",
    city: "Recife, PE",
    verified: false,
    free: true,
    price: 0,
    subscribers: 7100,
    posts: 67,
  },
  {
    id: "bia",
    name: "Bia Campos",
    username: "biacampos",
    avatar: "/media/avatars/bia.jpg",
    cover: "/media/covers/bia.jpg",
    category: "Arte",
    bio: "Processos, sketchbooks e encontros criativos ao vivo.",
    city: "Salvador, BA",
    verified: true,
    free: false,
    price: 1290,
    subscribers: 6300,
    posts: 88,
  },
  {
    id: "rafa",
    name: "Rafa Medeiros",
    username: "rafamedeiros",
    avatar: "/media/avatars/rafa.jpg",
    cover: "/media/covers/rafa.jpg",
    category: "Corrida",
    bio: "Planilhas, provas e tudo o que aprendi correndo por aí.",
    city: "Brasília, DF",
    verified: true,
    free: false,
    price: 1790,
    subscribers: 5800,
    posts: 104,
  },
];

export const posts: Post[] = [
  { id: "p1", creatorId: "marina", image: "/media/posts/marina-1.jpg", caption: "Um pedaço do meu roteiro favorito — e o guia completo já está por aqui ✦", visibility: "free", likes: 2814, time: "há 24 min" },
  { id: "p2", creatorId: "lucas", image: "/media/posts/lucas-1.jpg", caption: "Treino novo: 35 minutos, zero equipamento. Salva para fazer comigo.", visibility: "subscriber", likes: 1920, time: "há 1 h" },
  { id: "p3", creatorId: "helena", image: "/media/posts/helena-1.jpg", caption: "A salada que converte até quem jura que não gosta. Receita aberta para todo mundo 💛", visibility: "free", likes: 1433, time: "há 2 h" },
  { id: "p4", creatorId: "theo", image: "/media/posts/theo-1.jpg", caption: "Acústico inédito gravado ontem, do jeitinho que saiu no primeiro take.", visibility: "ppv", price: 990, likes: 876, time: "há 3 h" },
  { id: "p5", creatorId: "sofia", image: "/media/posts/sofia-1.jpg", caption: "Provador de hoje: três ideias e uma peça que mudou tudo.", visibility: "subscriber", likes: 1204, time: "há 5 h" },
  { id: "p6", creatorId: "bia", image: "/media/posts/bia-1.jpg", caption: "Do rascunho à tela. Vem ver o processo inteiro.", visibility: "ppv", price: 790, likes: 724, time: "ontem" },
];

export const conversations = [
  { id: "marina", creatorId: "marina", preview: "Separei um conteúdo especial pra você ✨", time: "15:13", unread: 2 },
  { id: "lucas", creatorId: "lucas", preview: "Como foi o treino de hoje?", time: "12:42", unread: 0 },
  { id: "helena", creatorId: "helena", preview: "A lista de ingredientes está aqui!", time: "ontem", unread: 0 },
  { id: "theo", creatorId: "theo", preview: "Ouviu a demo nova?", time: "seg", unread: 1 },
];

export const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);

export const compact = (value: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
