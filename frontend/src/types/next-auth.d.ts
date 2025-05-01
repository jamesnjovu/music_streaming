import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Extending the built-in User type
   */
  interface User {
    id: string
    role: string
  }

  /**
   * Extending the built-in Session type
   */
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT type
   */
  interface JWT {
    id: string
    role: string
  }
}