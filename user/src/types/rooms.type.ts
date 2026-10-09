import { z } from 'zod'

export const roomSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    roomCode: z.string(),
    maxPlayers: z.number(),
    createdAt: z.date(),
    gameId: z.string(),
    passwordHash: z.string(),
    hostId: z.string(),
    visibility: z.enum(["public", "private"]),
    status: z.enum(["waiting", "started", "finished"]),
    startedAt: z.date(),
    finishedAt: z.date(),
})

export const createRoomSchema = roomSchema.omit({
    id: true,
    createdAt: true,
    startedAt: true,
    finishedAt: true,
    status: true,
}).extend({
    passwordHash: z.string().optional(),
})

export const updateRoomSchema = roomSchema.partial().pick({
    status: true,
    startedAt: true,
    finishedAt: true
})

export const joinRoomSchema = roomSchema.pick({
    roomCode: true
}).extend({
    passwordHash: z.string().optional(),
})

export type RoomType = z.infer<typeof roomSchema>
export type CreateRoomType = z.infer<typeof createRoomSchema>
export type UpdateRoomType = z.infer<typeof updateRoomSchema>
export type JoinRoomType = z.infer<typeof joinRoomSchema>