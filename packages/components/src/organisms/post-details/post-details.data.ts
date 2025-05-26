// Example data for PostDetailsType
export const POST_DETAILS_DATA = {
  id: "post-1",
  owner: {
    id: "u1",
    userName: "alice_johnson",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
    isAvatar: false,
    name: "Alice Johnson",
    brand: {
      id: "b1",
      name: "BrandX",
      handle: "brandx",
      logo: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
  },
  community: {
    id: "c1",
    name: "React Learners",
    isPrivate: false,
    shareUrl: "https://genuin.com/community/react-learners",
    profileImage: "https://randomuser.me/api/portraits/lego/2.jpg",
    userRole: "MEMBER" as const,
  },
  group: {
    id: "g1",
    name: "Frontend Masters",
    slug: "frontend-masters",
    shareUrl: "https://genuin.com/group/frontend-masters",
    isJoined: true,
    isNotificationsEnabled: true,
  },
  createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  description:
    "This post covers advanced React patterns and best practices for scalable frontend development. Dive deep into hooks, context, and performance optimizations!",
};
