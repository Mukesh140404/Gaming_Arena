import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { createRoomSchema, rooms } from "../../db/schema/rooms.js";
import { games } from "../../db/schema/games.js";
import { users } from "../../db/schema/users.js";
import { roomPlayers } from "../../db/schema/roomPlayers.js";
import { db } from "../../db/index.js";
import { and, eq } from "drizzle-orm";
import { ApiError } from "../../lib/ApiError.js";
import { ApiResponse } from "../../lib/ApiResponse.js";
import { comparePassword, hashPassword } from "../../utils/password.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const createRoom = asyncHandler(async (req: Request, res: Response) => {
    const parsedBody = createRoomSchema.parse(req.body);
    if (parsedBody.visibility === "private" && !parsedBody.passwordHash) {
        throw new ApiError(409, "password is required for private rooms")
    }
    const [existingRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomCode, parsedBody.roomCode))

    if (existingRoom) {
        throw new ApiError(400, "Room already exists")
    }

    const hostId = req.user?.id;
    const passwordHash = parsedBody.passwordHash
        ? await hashPassword(parsedBody.passwordHash)
        : null
    if (!hostId) {
        throw new ApiError(401, "Unauthorized")
    }

    const [createdRoom] = await db
        .insert(rooms)
        .values({
            roomCode: parsedBody.roomCode,
            gameId: parsedBody.gameId,
            hostId: hostId,
            name: parsedBody.name,
            visibility: parsedBody.visibility,
            passwordHash: passwordHash,
            maxPlayers: parsedBody.maxPlayers
        })
        .returning()

    // Add host as the initial player in roomPlayers
    await db.insert(roomPlayers).values({
        roomId: createdRoom.id,
        userId: hostId,
        role: "host",
        status: "active"
    }).catch(() => {});

    return res
        .status(201)
        .json(new ApiResponse(201, createdRoom, "Room created successfully"))
})

const joinRoom = asyncHandler(async (req: Request, res: Response) => {
    const { roomCode, password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const [existingRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.roomCode, roomCode))

    if (!existingRoom) {
        throw new ApiError(404, "Room not found")
    }

    if (existingRoom.status !== "waiting") {
        throw new ApiError(400, "Room is not waiting")
    }
    const isPasswordValid = existingRoom.passwordHash
        ? await comparePassword(password, existingRoom.passwordHash)
        : false

    if(existingRoom.visibility ==="private" && !isPasswordValid){
        throw new ApiError(401, "Invalid password");
    }
    const [existingPlayer] = await db
        .select()
        .from(roomPlayers)
        .where(and(
            eq(roomPlayers.roomId, existingRoom.id),
            eq(roomPlayers.userId, userId)
        ))

    if (existingPlayer) {
        if (existingPlayer.status === "active") {
            throw new ApiError(400, "User is already in a room")
        } else {
            const [updatedPlayer] = await db
                .update(roomPlayers)
                .set({
                    status: "active",
                    joinedAt: new Date(),
                    leftAt: null
                })
                .where(eq(roomPlayers.id, existingPlayer.id))
                .returning();
            return res
                .status(200)
                .json(new ApiResponse(200, updatedPlayer, "User joined room successfully"));
        }
    }

    const [createdPlayer] = await db.insert(roomPlayers).values({
        roomId: existingRoom.id,
        userId: userId,
        role: "player",
        status: "active"
    }).returning();

    return res
        .status(200)
        .json(new ApiResponse(200, createdPlayer, "User joined room successfully"));

})

const leaveRoom = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const roomId = req.params.roomId as string;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const [existingPlayer] = await db
        .select()
        .from(roomPlayers)
        .where(
            and(
                eq(roomPlayers.userId, userId),
                eq(roomPlayers.roomId, roomId)
            )
        )

    if (!existingPlayer) {
        throw new ApiError(404, "Player not found");
    }

    const [updatedPlayer] = await db
        .update(roomPlayers)
        .set({
            status: "left",
            leftAt: new Date()
        })
        .where(eq(roomPlayers.id, existingPlayer.id))
        .returning();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlayer, "User left room successfully"));
})

const destroyRoom = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const roomId = req.params.roomId as string;

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!roomId || !UUID_REGEX.test(roomId)) {
        throw new ApiError(404, "Room not found");
    }

    const [existingRoom] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId));

    if (!existingRoom) {
        throw new ApiError(404, "Room not found");
    }

    if (existingRoom.hostId !== userId) {
        throw new ApiError(403, "User is not the host");
    }

    const [updatedRoom] = await db
        .update(rooms)
        .set({
            status: "finished",
            finishedAt: new Date()
        })
        .where(eq(rooms.id, roomId))
        .returning();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRoom, "Room destroyed successfully"));
})

const getRoom = asyncHandler(async (req: Request, res: Response) => {
    const roomId = req.params.roomId as string;

    if (!roomId || !UUID_REGEX.test(roomId)) {
        throw new ApiError(404, "Room not found");
    }

    const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId));

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    const roomPlayersList = await db
        .select({
            id: roomPlayers.id,
            roomId: roomPlayers.roomId,
            userId: roomPlayers.userId,
            role: roomPlayers.role,
            status: roomPlayers.status,
            joinedAt: roomPlayers.joinedAt,
            name: users.name,
            email: users.email,
        })
        .from(roomPlayers)
        .leftJoin(users, eq(roomPlayers.userId, users.id))
        .where(eq(roomPlayers.roomId, roomId));

    const { passwordHash, ...safeRoom } = room;

    return res
        .status(200)
        .json(new ApiResponse(200, { ...safeRoom, roomPlayersList }, "Room retrieved successfully"));
})

const getAllRoomsOfGame = asyncHandler(async (req: Request, res: Response) => {
    const gameId = req.params.gameId as string;
    let targetGameId = gameId;

    if (!gameId) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "All Rooms fetched for the game"));
    }

    // If gameId is not a UUID, check if it's a slug
    if (!UUID_REGEX.test(gameId)) {
        const [foundGame] = await db
            .select()
            .from(games)
            .where(eq(games.slug, gameId));

        if (foundGame) {
            targetGameId = foundGame.id;
        } else {
            return res
                .status(200)
                .json(new ApiResponse(200, [], "All Rooms fetched for the game"));
        }
    }

    const roomsList = await db
        .select()
        .from(rooms)
        .where(and(eq(rooms.gameId, targetGameId),eq(rooms.status,"waiting")));

    return res
        .status(200)
        .json(new ApiResponse(200, roomsList || [], "All Rooms fetched for the game"))
})

export { createRoom, joinRoom, leaveRoom, destroyRoom, getRoom, getAllRoomsOfGame }