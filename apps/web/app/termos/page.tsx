import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return <LegalDocument id="terms" />;
}
