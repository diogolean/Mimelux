import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MODEL = "gemini-2.5-flash-image";
const API_ROOT = "https://generativelanguage.googleapis.com/v1beta/models";
const OUTPUT_DIR = path.resolve("apps/web/public/media/generated");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "generation-manifest.json");

type AssetKind = "avatar" | "cover" | "post";

type CreatorImageFixture = {
  id: string;
  displayName: string;
  fictitious: true;
  aiGenerated: true;
  visualIdentity: string;
  assets: Array<{
    kind: AssetKind;
    file: string;
    prompt: string;
    status: "pending" | "generated" | "failed";
    mimeType?: string;
    generatedAt?: string;
    error?: string;
  }>;
};

const creatorProfiles = [
  ["luna-ferraz", "Luna Ferraz", "Brazilian-Portuguese travel storyteller, warm olive skin, long dark wavy hair, amber eyes, understated linen style"],
  ["bella-monroe", "Bella Monroe", "British-Brazilian fashion creator, light brown skin, short sculpted curls, expressive hazel eyes, minimal editorial style"],
  ["nina-valenca", "Nina Valença", "Brazilian wellness creator, deep brown skin, natural coily hair, confident calm expression, soft athletic style"],
  ["sofia-blake", "Sofia Blake", "Brazilian-American music creator, fair warm skin, shoulder-length black hair with fringe, modern monochrome style"],
  ["maya-costa", "Maya Costa", "Afro-Brazilian visual artist, rich dark skin, braided updo, bright thoughtful expression, colorful contemporary style"],
  ["leo-monteiro", "Leo Monteiro", "Brazilian fitness creator, tan skin, short textured dark hair, friendly expression, refined athletic style"],
  ["clara-hayes", "Clara Hayes", "Brazilian-Canadian food creator, freckled medium skin, copper curls, welcoming expression, elegant casual style"],
  ["enzo-vale", "Enzo Vale", "Brazilian-Italian musician, medium olive skin, dark curly hair, subtle beard, sophisticated relaxed style"],
  ["isla-moretti", "Isla Moretti", "Brazilian-Italian design creator, golden brown skin, sleek dark bob, architectural jewelry, premium minimal style"],
  ["noah-santoro", "Noah Santoro", "Brazilian lifestyle creator, light olive skin, wavy chestnut hair, approachable expression, quiet luxury style"],
  ["amal-souza", "Amal Souza", "Brazilian-Middle Eastern beauty creator, warm brown skin, long black hair, elegant natural makeup, refined style"],
  ["theo-laurent", "Theo Laurent", "French-Brazilian photography creator, medium skin, close-cropped curls, creative thoughtful expression, modern neutral style"],
] as const;

function assetPrompt(
  name: string,
  identity: string,
  kind: AssetKind,
  postIndex = 0,
) {
  const common =
    `Create an original, SFW, tasteful premium lifestyle image of a completely fictitious adult AI model named ${name}. ` +
    `Visual identity: ${identity}. The person must not resemble any real public figure or identifiable person. ` +
    "Editorial photography, natural skin texture, sophisticated warm beige and peach color grade, no text, no logo, no watermark, no nudity, no lingerie, no suggestive pose.";

  if (kind === "avatar") {
    return `${common} Head-and-shoulders portrait, direct but friendly gaze, soft studio daylight, neutral warm background, centered composition, square crop.`;
  }
  if (kind === "cover") {
    return `${common} Wide cinematic environmental portrait related to their creator niche, subject placed off-center with generous negative space, landscape 2:1 crop.`;
  }
  const scenes = [
    "candid behind-the-scenes moment in a beautiful daylight studio",
    "premium lifestyle scene outdoors during golden hour",
    "creative process close-up with tasteful tools and objects",
  ];
  return `${common} ${scenes[postIndex % scenes.length]}, vertical editorial composition, 4:5 crop.`;
}

function createManifest(): CreatorImageFixture[] {
  return creatorProfiles.map(([id, displayName, visualIdentity]) => ({
    id,
    displayName,
    fictitious: true,
    aiGenerated: true,
    visualIdentity,
    assets: [
      {
        kind: "avatar",
        file: `${id}-avatar.png`,
        prompt: assetPrompt(displayName, visualIdentity, "avatar"),
        status: "pending",
      },
      {
        kind: "cover",
        file: `${id}-cover.png`,
        prompt: assetPrompt(displayName, visualIdentity, "cover"),
        status: "pending",
      },
      ...Array.from({ length: 3 }, (_, index) => ({
        kind: "post" as const,
        file: `${id}-post-${index + 1}.png`,
        prompt: assetPrompt(displayName, visualIdentity, "post", index),
        status: "pending" as const,
      })),
    ],
  }));
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as CreatorImageFixture[];
  } catch {
    return createManifest();
  }
}

async function generateImage(prompt: string, apiKey: string) {
  const response = await fetch(
    `${API_ROOT}/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API ${response.status}: ${await response.text()}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string };
        }>;
      };
    }>;
  };

  const image = payload.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .find((part) => part.inlineData?.data)?.inlineData;

  if (!image?.data) {
    throw new Error("Gemini returned no image data.");
  }

  return {
    bytes: Buffer.from(image.data, "base64"),
    mimeType: image.mimeType ?? "image/png",
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const manifest = await loadManifest();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    console.warn(
      "GEMINI_API_KEY is not set. Manifest is ready; existing local placeholders remain active.",
    );
    return;
  }

  for (const creator of manifest) {
    for (const asset of creator.assets) {
      if (asset.status === "generated") continue;
      process.stdout.write(`Generating ${creator.id}/${asset.file}... `);
      try {
        const image = await generateImage(asset.prompt, apiKey);
        await writeFile(path.join(OUTPUT_DIR, asset.file), image.bytes);
        asset.status = "generated";
        asset.mimeType = image.mimeType;
        asset.generatedAt = new Date().toISOString();
        delete asset.error;
        console.log("done");
      } catch (error) {
        asset.status = "failed";
        asset.error = error instanceof Error ? error.message : String(error);
        console.error("failed");
      }
      await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
