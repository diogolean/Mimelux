import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = { title: "Diretrizes de conteúdo" };

export default function GuidelinesPage() {
  return <LegalDocument id="guidelines" />;
}
