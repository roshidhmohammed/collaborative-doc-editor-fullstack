import 'server-only'
import prisma from '../db/prisma'

export const getUser = async (session: { isAuth?: boolean; userId?: string | unknown; [key: string]: any } | null | undefined) => {
  if (!session?.isAuth) return null
 
  try {
    const data = await prisma.user.findUnique({
      where: {
        id: String(session.userId),
      },
    })
 
    const user = data
 
    return user
  } catch (error) {
    return null
  }
}