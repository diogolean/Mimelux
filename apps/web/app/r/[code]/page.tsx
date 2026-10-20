import { redirect } from "next/navigation";
import { demoAffiliate } from "@/lib/affiliates";
import { creators } from "@/lib/gateway";

export default async function ReferralCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const query = await searchParams;
  const slug = creators[0]?.username;
  if (code === demoAffiliate.code && slug) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === "string") next.set(key, value);
      else if (value?.[0]) next.set(key, value[0]);
    }
    const suffix = next.toString();
    redirect(suffix ? `/r/${code}/${slug}?${suffix}` : `/r/${code}/${slug}`);
  }
  redirect("/topcreators?tab=top-creators");
}
