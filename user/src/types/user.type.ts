import {z} from 'zod'

export const userSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["admin", "user"]),
    passwordHash: z.string(),
    createdAt: z.date(),
})

export type UserType = z.infer<typeof userSchema>