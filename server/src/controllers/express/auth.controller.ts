import { Request, Response } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { userLoginSchema, users, userSignUpSchema } from "../../db/schema/users";
import { ApiError } from "../../lib/ApiError";
import { db } from "../../db/index";
import { eq } from "drizzle-orm";
import { comparePassword, hashPassword } from "../../utils/password";
import { signToken } from "../../utils/jwt";
import { clearAuthCookie, setAuthCookie } from "../../utils/cookie";
import { ApiResponse } from "../../lib/ApiResponse";

const signUp = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = userSignUpSchema.parse(req.body);
  if (!parsedBody.email || !parsedBody.name || !parsedBody.passwordHash || !parsedBody.role) {
    throw new ApiError(400, "All fields are required");
  }
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsedBody.email))
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  const hashedPassword = await hashPassword(parsedBody.passwordHash);

  const [createdUser] = await db
    .insert(users)
    .values({
      name: parsedBody.name,
      email: parsedBody.email,
      passwordHash: hashedPassword,
      role: parsedBody.role
    })
    .returning();

  const token = signToken({
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
  });
  setAuthCookie(res, token);
  const { passwordHash: _password, ...safeUser } = createdUser;
  return res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User created successfully"));

})

const login = asyncHandler(async (req: Request, res: Response) => {
  const parsedBody = userLoginSchema.parse(req.body);
  if (!parsedBody.email || !parsedBody.passwordHash) {
    throw new ApiError(400, "Email and password are required");
  }
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsedBody.email));

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  const isPasswordValid = await comparePassword(
    parsedBody.passwordHash,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  setAuthCookie(res, token);
  const { passwordHash: _password, ...safeUser } = user;
  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User logged in successfully"));
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookie(res);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const { passwordHash: _password, ...safeUser } = user;
  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User retrieved successfully"));
});

export { login, signUp, logout, getMe };
