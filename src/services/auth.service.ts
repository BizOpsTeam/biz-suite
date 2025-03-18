
import { TUser } from "../constants/types";
import prisma from "../config/db";
import appAssert from "../utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import { comparePasswords, hashPassword } from "../utils/bcrypt";

export const createUserAccount = async(user: TUser) => {
    //check if user already exists in database
    const existingUser = await prisma.userModel.findUnique({ where: { email: user.email }});
    appAssert(!existingUser, CONFLICT ,"User already exists", "409")

    const hashedPassword = await hashPassword(user.password)

    //if not, create a new user in the database
    const newUser = await prisma.userModel.create({data: {...user, password: hashedPassword}, select: { email: true, id: true, createdAt: true, name: true}})

    return newUser
} 

export const saveRefreshToken = async(refreshToken: string, userId: string) => {
    //save refresh token in your database using userId as a reference
    await prisma.refreshToken.create({
        data: { token: refreshToken, userId, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    })
}

export const verifyRefreshTokenInDB = async (token: string) => {
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
    });

    // Ensure the token exists
    appAssert(storedToken, UNAUTHORIZED, "Invalid or expired refresh token");

    // Check if the token is expired
    const isExpired = new Date(storedToken.expiresAt) < new Date();
    appAssert(!isExpired, UNAUTHORIZED, "Refresh token expired");

    return storedToken.userId;
};


export const loginUser = async(email: string, password: string) => {
    const user = await prisma.userModel.findUnique({ where: { email } });
    appAssert(user, UNAUTHORIZED, "Invalid email or password");

    const isPasswordValid = await comparePasswords(password, user.password)
    appAssert(isPasswordValid, UNAUTHORIZED, "Invalid email or password");
    return user
}

export const revokeAllRefreshTokensForAUser = async(userId: string) => {
    await prisma.refreshToken.deleteMany({ 
        where: {userId}
    })
}

export const storeHashedToken = async(token: string, userId: string, expiresAt: Date) => {
    await prisma.resetPasswordModel.create({
        data: {
            userId: userId,
            token,
            expiresAt
        }
    })
}

export const verifyResetPasswordToken = async (token: string) => {
    const resetPasswordToken = await prisma.resetPasswordModel.findUnique({
        where: { token, expiresAt: { gt: new Date()} },
        select: { userId: true, expiresAt: true }
    });

    appAssert(resetPasswordToken, UNAUTHORIZED ,`Tokne is not valid`)
    return resetPasswordToken.userId
}

export const updatePassword = async (userId: string, newPassword: string) => {
    const hashedPassword = await hashPassword(newPassword);
    await prisma.userModel.update({
        where: {id: userId },
        data: {
            password: hashedPassword
        }
    })
}
