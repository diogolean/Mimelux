import { notFound } from "next/navigation";
import { CreatorProfile } from "@/components/creator-profile";
import { creators, posts } from "@/lib/mock-data";

export default async function CreatorPage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await props.params;
  const creator = creators.find((item) => item.username === username);
  if (!creator) notFound();

  const creatorPosts = posts.filter((post) => post.creatorId === creator.id);
  const fallbackPosts = posts
    .filter((post) => post.creatorId !== creator.id)
    .slice(0, Math.max(0, 5 - creatorPosts.length))
    .map((post, index) => ({
      ...post,
      id: `${creator.id}-extra-${index}`,
      creatorId: creator.id,
    }));

  return <CreatorProfile creator={creator} posts={[...creatorPosts, ...fallbackPosts]} />;
}
