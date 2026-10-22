import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, readdir, rm, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

export type ObjectStorage = {
  root: string;
  write(key: string, data: Buffer): Promise<void>;
  readStream(key: string): Readable;
  size(key: string): Promise<number>;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
};

const preferredRoot = "/opt/patrocino/media";

export function mediaDiskKey(key: string) {
  const bare = (key.split("?")[0] ?? key).replace(/\\/g, "/");
  if (bare.startsWith("/media/")) return bare.slice("/media/".length);
  return bare.replace(/^\/+/, "");
}

export function mediaRoot() {
  return process.env.MEDIA_ROOT || preferredRoot;
}

export class DiskStorage implements ObjectStorage {
  constructor(readonly root: string) {}

  resolve(key: string) {
    const stripped = mediaDiskKey(key).replace(/^[/\\]+/, "");
    const normal = path.normalize(stripped);
    if (normal === ".." || normal.startsWith(`..${path.sep}`) || path.isAbsolute(normal)) {
      throw new Error("Storage key escapes the media root");
    }
    const absolute = path.resolve(this.root, normal);
    const root = path.resolve(this.root);
    if (absolute !== root && !absolute.startsWith(root + path.sep)) {
      throw new Error("Storage key escapes the media root");
    }
    return absolute;
  }

  async write(key: string, data: Buffer) {
    const absolute = this.resolve(key);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, data);
  }

  readStream(key: string) {
    return createReadStream(this.resolve(key));
  }

  async size(key: string) {
    const info = await stat(this.resolve(key));
    return info.size;
  }

  async exists(key: string) {
    try {
      await access(this.resolve(key), constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  async remove(key: string) {
    await rm(this.resolve(key), { force: true });
  }
}

export async function openStorage(): Promise<DiskStorage> {
  const root = mediaRoot();
  try {
    await mkdir(root, { recursive: true });
    await access(root, constants.W_OK);
    return new DiskStorage(root);
  } catch {
    const fallback = path.join("/tmp", "patrocino-media");
    await mkdir(fallback, { recursive: true });
    return new DiskStorage(fallback);
  }
}

export async function assembleChunks(directory: string, totalChunks: number, destination: string) {
  await mkdir(path.dirname(destination), { recursive: true });
  const output = createWriteStream(destination);
  for (let index = 0; index < totalChunks; index += 1) {
    const part = path.join(directory, `${index}.part`);
    await pipeline(createReadStream(part), output, { end: false });
  }
  await new Promise<void>((resolve, reject) => {
    output.on("error", reject);
    output.end(() => resolve());
  });
}

export async function receivedChunkIndexes(directory: string) {
  try {
    const names = await readdir(directory);
    return names
      .filter((name) => name.endsWith(".part"))
      .map((name) => Number(name.replace(/\.part$/, "")))
      .filter((index) => Number.isInteger(index))
      .sort((left, right) => left - right);
  } catch {
    return [];
  }
}
