// TODO: change optional ot non-optional params.
export const PATH_NAME = {
  loop: (id?: string) => `/app/loop/${id}`,
  video: (id?: string) => `/app/video/${id}`,
  profile: (id?: string) => `/app/profile/${id}`,
  community: (id?: string) => `/app/community/${id}`,
  terms: `/terms`,
  privacy: `/privacy`,
}
