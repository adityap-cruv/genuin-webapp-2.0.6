import type { PostTileDataType } from "src/molecules/post-tile";

import { PostsGrid } from "../posts-grid";

const FAKE_POSTS: PostTileDataType[] = Array.from({ length: 20 }, (_, i) => ({
  postId: (i + 1).toString(),
  title: `Post Title ${i + 1}`,
  imageUrl:
    "https://media.qa.begenuin.com/uploads/thumbnails/1691038031235.png",
  author: `Author ${i + 1}`,
  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0], // Generates dates decrementing from today
  isPinned: i < 5,
  linkouts: Math.random() > 0.5 ? "https://example.com" : undefined,
  stats: {
    views: Math.floor(Math.random() * 10000000),
    comments: Math.floor(Math.random() * 10000),
    shares: Math.floor(Math.random() * 50),
  },
}));

//TODO: ADD api calls here.
export function Posts() {
  return (
    <PostsGrid
      className=""
      posts={FAKE_POSTS}
      fetchNextPage={() => {}}
      hasNextPage
    />
  );
}
