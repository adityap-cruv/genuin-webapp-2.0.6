// TODO: change optional ot non-optional params.
export const PATH_NAME = {
  loop: (id?: string) => `/loop/${id}`,
  video: (id?: string) => `/video/${id}`,
  profile: (id?: string) => `/profile/${id}`,
  community: (id?: string) => `/community/${id}`,
  home: () => `/home`,
  popular: () => `/popular`,
  latest: () => `/latest`,
  search: () => `/search`,
  careers: () => 'https://careers.begenuin.com',
  terms: `/terms`,
  privacy: `/privacy`,
}
