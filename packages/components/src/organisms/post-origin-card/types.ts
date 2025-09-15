export interface PostOriginCardProps {
  community: Partial<{
    name: string;
    slug: string;
    profileImage: string | null;
    isPrivate: boolean;
  }>;
  group: Partial<{
    name: string;
    slug: string;
    actions: {
      action_id: number;
      access_type_id: number;
    }[];
  }>;
}
