import { withAssetVersion } from "./assets";
import { imageFile } from "./initial-creators";

const demoExtraAnchor = Date.UTC(2026, 6, 1, 12, 0, 0);
const demoWave2Anchor = Date.UTC(2026, 8, 1, 12, 0, 0);

const captions = {
  lifestyle: [
    "Café passado e a luz da manhã na mesa.",
    "Uma pausa longa no meio da tarde.",
    "A janela aberta e o barulho baixo da rua.",
    "Lista curta do que ficou para amanhã.",
    "O canto da sala depois que a casa acalma.",
    "Um livro aberto e o chá esfriando.",
    "Sábado sem hora marcada.",
    "A planta da varanda pediu água.",
    "Luz dourada no corredor.",
    "O fim do dia, devagar.",
  ],
  moda: [
    "O look de hoje saiu de três peças só.",
    "Tecido leve e uma barra para ajustar.",
    "Sapato novo, passo curto, espelho honesto.",
    "A prova de roupa ficou melhor na segunda tentativa.",
    "Bolso, cinto e um detalhe quase escondido.",
    "Cor neutra com um ponto de cor no colar.",
    "O casaco da estação, dobrado na cadeira.",
    "Costura aparente de propósito.",
    "Look de fim de tarde, sem pressa para trocar.",
    "A arara está mais vazia e o conjunto ficou certo.",
  ],
  beleza: [
    "Pele limpa e um hidratante que não pesa.",
    "Cabelo solto, só a raiz penteada.",
    "Sombra baixa e um batom que dura o café.",
    "Rotina curta antes de sair.",
    "Unha curta e esmalte quase da cor da pele.",
    "O espelho da pia, com a luz do dia.",
    "Máscara rápida enquanto a chaleira esquenta.",
    "Perfume no pulso, nada além disso hoje.",
    "Sobrancelha penteada e pronto.",
    "Noite de cuidado, sem pressa de resultado.",
  ],
  fitness: [
    "Aquecimento curto e o primeiro bloco de força.",
    "Alongamento no chão, respiração contada.",
    "Caminhada sem fone, só o ritmo do passo.",
    "Série leve para não perder o hábito.",
    "Água, toalha e o timer do descanso.",
    "Mobilidade de quadril antes do treino.",
    "O último bloco foi mais devagar.",
    "Alongar o pescoço depois da tela.",
    "Treino em casa, tapete no mesmo lugar.",
    "Encerrar com três respirações longas.",
  ],
  viagem: [
    "A rua de manhã, antes da fila do café.",
    "Janela do quarto e um telhado novo.",
    "Mapa dobrado no bolso, sem destino fechado.",
    "Fim de tarde na beira da água.",
    "Uma praça, um banco e vinte minutos parados.",
    "O embarque atrasou e a luz ficou boa.",
    "Comida de esquina, sem reserva.",
    "Escada estreita e uma vista inesperada.",
    "O caminho de volta, mais devagar que a ida.",
    "Mala pequena e um dia inteiro pela frente.",
  ],
  musica: [
    "Ensaio curto, só voz e um violão.",
    "O acorde que ainda estou ajustando.",
    "Silêncio antes da primeira nota.",
    "Palco pequeno, luz quente, público perto.",
    "Uma ideia gravada no celular, sem edição.",
    "Partitura na mesa e café ao lado.",
    "O refrão saiu melhor na terceira vez.",
    "Baixo no fundo, quase um murmúrio.",
    "Dedilhado lento para não correr.",
    "A música de hoje cabe em dois minutos.",
  ],
  gastronomia: [
    "Mesa posta para uma pessoa só.",
    "Tempero medido na palma, sem balança.",
    "O forno ainda quente e o pão descansando.",
    "Feira cedo, alface e um limão.",
    "Molho reduzindo enquanto corto a salada.",
    "Prato fundo, caldo claro, pão na beirada.",
    "Sobremesa pequena, só fruta e iogurte.",
    "A pia depois do almoço, organizada.",
    "Receita nova, primeira tentativa.",
    "Jantar tarde, luz baixa, panela tampada.",
  ],
} as const;

const wave2Captions = {
  lifestyle: [
    "A xícara lavada e a mesa ainda com migalhas.",
    "Cadeira na janela, sem ninguém sentado.",
    "O casaco no encosto, pronto para sair.",
    "Luz da cozinha depois do jantar.",
    "Um canto do sofá e o cobertor dobrado.",
  ],
  moda: [
    "A barra da calça, só o detalhe.",
    "Espelho de corpo, sem pose marcada.",
    "O colar sobre o tecido cru.",
    "Manga dobrada duas vezes.",
    "Sapato ao lado da porta, ainda amarrado.",
  ],
  beleza: [
    "Toalha no ombro e o cabelo úmido.",
    "Pincel limpo antes da sombra.",
    "Hidratante na palma, ainda sem espalhar.",
    "Luz do banheiro, sem filtro.",
    "O batom fechado ao lado da pia.",
  ],
  fitness: [
    "O tapete no chão, antes de começar.",
    "Garrafa ao lado do peso.",
    "Alongamento de panturrilha na parede.",
    "O timer zerado no descanso.",
    "Tênis desamarrado depois do treino.",
  ],
  viagem: [
    "A rua ainda molhada de manhã.",
    "Bilhete no bolso, horário anotado à mão.",
    "Vista da janela do ônibus.",
    "Banco de praça e a mochila no chão.",
    "O cais no fim da tarde.",
  ],
  musica: [
    "O microfone baixo, ainda desligado.",
    "Dedos no braço do violão, sem acorde.",
    "Caderno de cifras aberto na primeira página.",
    "A cadeira do ensaio, vazia.",
    "Cabo enrolado ao lado do amplificador.",
  ],
  gastronomia: [
    "A faca limpa e a tábua ainda seca.",
    "Azeite no canto do prato.",
    "Panela tampada, fogo baixo.",
    "O pão partido, ainda quente.",
    "Ervas picadas na tigela pequena.",
  ],
} as const;

const videoCaptions = {
  lifestyle: "Um minuto da manhã, sem narração.",
  moda: "O look girando devagar, sem corte.",
  beleza: "A rotina em poucos segundos, sem fala.",
  fitness: "Uma série curta, no mesmo lugar de sempre.",
  viagem: "Alguns segundos da caminhada, sem destino.",
  musica: "Um trecho curto, só voz e violão.",
  gastronomia: "O refogado em poucos segundos.",
} as const;

type DemoNiche = keyof typeof captions;

export const demoExtraCreators = [
  { slug: "luna-ferraz", niche: "lifestyle" },
  { slug: "bella-monroe", niche: "moda" },
  { slug: "nina-valenca", niche: "beleza" },
  { slug: "sofia-blake", niche: "fitness" },
  { slug: "clara-duarte", niche: "viagem" },
  { slug: "mia-castell", niche: "musica" },
  { slug: "aiko-lume", niche: "moda" },
  { slug: "valentina-rios", niche: "fitness" },
  { slug: "zara-monteiro", niche: "beleza" },
  { slug: "elena-vidal", niche: "lifestyle" },
  { slug: "isis-amaral", niche: "viagem" },
  { slug: "grace-halden", niche: "musica" },
  { slug: "lara-nakamura", niche: "gastronomia" },
  { slug: "maya-torres", niche: "fitness" },
  { slug: "kiara-lopes", niche: "moda" },
  { slug: "alana-reis", niche: "viagem" },
] as const satisfies readonly { slug: string; niche: DemoNiche }[];

export type DemoExtraPost = {
  id: string;
  slug: string;
  file: string;
  path: string;
  poster?: string;
  playback: string;
  mediaId?: string;
  caption: string;
  free: boolean;
  likes: number;
  publishedAt: Date;
  kind: "image" | "video";
  durationMs?: number;
  width?: number;
  height?: number;
};

export function demoExtraPostPublishedAt(creatorIndex: number, postIndex: number) {
  return new Date(demoExtraAnchor - (creatorIndex * 10 + postIndex) * 60_000);
}

export function demoWave2PublishedAt(creatorIndex: number, postIndex: number) {
  return new Date(demoWave2Anchor - (creatorIndex * 6 + postIndex) * 60_000);
}

export function demoVideoMediaId(slug: string) {
  return `demo-media-${slug}-v001`;
}

export function demoExtraMediaPath(slug: string, file: string) {
  return withAssetVersion(`/media/models/demo/${slug}/${file}`);
}

export function demoExtraLikeCount(slug: string, index: number) {
  let hash = 0;
  for (const char of slug) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return 10 + ((hash + index * 17) % 391);
}

export function demoExtraPostsFor(slug: string): DemoExtraPost[] {
  const creatorIndex = demoExtraCreators.findIndex((creator) => creator.slug === slug);
  const creator = demoExtraCreators[creatorIndex];
  if (!creator) return [];
  const lines = captions[creator.niche];
  const july = lines.map((caption, index) => {
    const file = imageFile(index + 1);
    const path = demoExtraMediaPath(slug, file);
    return {
      id: `demo-extra-${slug}-${file.replace(".jpg", "")}`,
      slug,
      file,
      path,
      playback: path,
      caption,
      free: index < 3,
      likes: demoExtraLikeCount(slug, index),
      publishedAt: demoExtraPostPublishedAt(creatorIndex, index),
      kind: "image" as const,
    };
  });
  const images = wave2Captions[creator.niche].map((caption, index) => {
    const file = imageFile(index + 11);
    const path = demoExtraMediaPath(slug, file);
    return {
      id: `demo-extra-${slug}-${file.replace(".jpg", "")}`,
      slug,
      file,
      path,
      playback: path,
      caption,
      free: index < 2,
      likes: demoExtraLikeCount(slug, 10 + index),
      publishedAt: demoWave2PublishedAt(creatorIndex, index + 1),
      kind: "image" as const,
    };
  });
  const videoFile = "v001.mp4";
  const videoPath = demoExtraMediaPath(slug, videoFile);
  const videoFree = creatorIndex % 2 === 1;
  const mediaId = demoVideoMediaId(slug);
  const video = {
    id: `demo-extra-${slug}-v001`,
    slug,
    file: videoFile,
    path: videoPath,
    poster: demoExtraMediaPath(slug, "v001.jpg"),
    playback: videoFree ? videoPath : `/api/media/file/${mediaId}`,
    mediaId,
    caption: videoCaptions[creator.niche],
    free: videoFree,
    likes: demoExtraLikeCount(slug, 15),
    publishedAt: demoWave2PublishedAt(creatorIndex, 0),
    kind: "video" as const,
    durationMs: 6_040,
    width: 480,
    height: 640,
  };
  return [...july, ...images, video];
}

export function allDemoExtraPosts() {
  return demoExtraCreators.flatMap((creator) => demoExtraPostsFor(creator.slug));
}
