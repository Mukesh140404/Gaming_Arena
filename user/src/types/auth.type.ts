import {z} from 'zod'
import { userSchema } from './user.type';

export const userLoginInputSchema = userSchema.pick({
    email: true,
    passwordHash: true
})

export const userLoginOutputSchema = userSchema.omit({
    passwordHash: true
})

export const userRegisterInputSchema = userSchema.omit({
    id: true,
    createdAt: true
})

export type UserLoginInput = z.infer<typeof userLoginInputSchema>;
export type UserLoginOutput = z.infer<typeof userLoginOutputSchema>;
export type SelectUser = z.infer<typeof userLoginOutputSchema>; 
export type UserRegisterInput = z.infer<typeof userRegisterInputSchema>;
export type UserRegisterOutput = z.infer<typeof userLoginOutputSchema>;