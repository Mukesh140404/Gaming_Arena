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
    // if (!parseBody) {
    //     throw new ApiError(400, "All Fields are required!")
    // }
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
    const { id } = req.params as { id: string }
    if (!id) {
        throw new ApiError(400, "game id is required!")
    }
    const [game] = await db
        .select()
        .from(games)
        .where(eq(games.id, id))

    if(!game){
        throw new ApiError(404,"this game is not found")
    }
    const parseBody = gameUpdateSchema.parse(req.body)
    // if (!parseBody) {
    //     throw new ApiError(409, "Unknown feild not allowed")
    // }
    const [updatedGame] = await db
        .update(games)
        .set(parseBody)
        .where(eq(games.id, id))
        .returning()
    if (!updatedGame) {
        throw new ApiError(500, "something error occured in db updation")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedGame, "game updated successfully")
        )

})

const getGameById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string }
    if (!id) {
        throw new ApiError(400, "game id is required!")
    }
    const [game] = await db
        .select()
        .from(games)
        .where(eq(games.id, id))
    if(!game){
        throw new ApiError(404,"Game not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,game,"game Fetched Successfully!"))
})

const deleteGame = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string }
    if (!id) {
        throw new ApiError(400, "game id is required!")
    }
    const [game] = await db
    .delete(games)
    .where(eq(games.id,id))
    .returning()
    if(!game){
        throw new ApiError(404,"Game not found")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,game,"Game Delete SuccessFully")
    )

})

const allGames = asyncHandler(async (req: Request, res: Response) => {
    const allGames = await db
    .select()
    .from(games)
    if(!allGames){
        throw new ApiError(404,"games not foun!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,allGames,"all games fetched successfully")
    )
})

export {
    addGame, updateGame, getGameById, deleteGame, allGames
}