import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const tinyJpeg = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhIQEhIVFhUVFRUVFRUVFRUVFRUWFxUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAQAAwAMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAADBAECBgcBA//EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==",
  "base64",
);

function run(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("ffmpeg", args, { stdio: "ignore" });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("ffmpeg timed out"));
    }, 60_000);
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}`));
    });
  });
}

export async function writePosterAndPreview(input: string, poster: string, preview: string, video: boolean) {
  await mkdir(path.dirname(poster), { recursive: true });
  await mkdir(path.dirname(preview), { recursive: true });
  const seek = video ? ["-ss", "0.5"] : [];
  try {
    await run(["-y", ...seek, "-i", input, "-frames:v", "1", "-vf", "scale=720:-2", poster]);
    await run(["-y", ...seek, "-i", input, "-frames:v", "1", "-vf", "scale=48:-2,boxblur=8:2,scale=720:-2", preview]);
  } catch {
    await writeFile(poster, tinyJpeg);
    await writeFile(preview, tinyJpeg);
  }
}
