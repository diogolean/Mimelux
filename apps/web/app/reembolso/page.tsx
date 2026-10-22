import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";

export const metadata: Metadata = { title: "Reembolso e cancelamento" };

export default function RefundPage() {
  return <LegalDocument id="refund" />;
}