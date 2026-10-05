import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { gameAddSchema, games, gameUpdateSchema } from "../../db/schema/games.js";
import { ApiError } from "../../lib/ApiError.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { slugify } from "../../utils/slug.js";
import { ApiResponse } from "../../lib/ApiResponse.js";

const addGame = asyncHandler(async (req: Request, res: Response) => {
    const parseBody = gameAddSchema.parse(req.body)
    if (!parseBody) {
        throw new ApiError(400, "All Fields are required!")
    }

    const gameSlug = slugify(parseBody.name)

    const [existinGame] = await db
        .select()
        .from(games)
        .where(eq(games.slug, gameSlug))
    if (existinGame) {
        throw new ApiError(409, "Game with this Name is already Exists!")
    }
    const [createdGame] = await db
        .insert(games)
        .values({
            name: parseBody.name,
            slug: gameSlug,
            description: parseBody.description,
            minPlayers: parseBody.minPlayers,
            maxPlayers: parseBody.maxPlayers,
            isActive: parseBody.isActive
        })
        .returning();

    return res
        .status(200)
        .json(new ApiResponse(201, createdGame, "Game Added SuccessFully!"))
})

const updateGame = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    if (!id) {
        throw new ApiError(400, "game id is required!")
    }
    const [game] = await db
        .select()
        .from(games)
        .where(eq(games.id, id as String))
    const parseBody = gameUpdateSchema.parse(req.body)
    if ()

})

const getGameById = asyncHandler(async (req: Request, res: Response) => {

})

const deleteGame = asyncHandler(async (req: Request, res: Response) => {

})

const allGames = asyncHandler(async (req: Request, res: Response) => {

})

export {
    addGame, updateGame, getGameById, deleteGame, allGames
}