export type MessageType = {
  owner: {
    userName: string
  }
  thumbnail: string
  createdAt?: string | null
}

export type MemberType = {
  userName: string
  profileImage: string
  isAvatar: boolean
  name: string
}
