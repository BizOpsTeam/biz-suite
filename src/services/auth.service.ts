import { TUser } from "../constants/types";
import prisma from "../config/db";
import appAssert from "../utils/appAssert";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";
import { comparePasswords, hashPassword } from "../utils/bcrypt";
import { sevenDaysFromNow } from "../utils/dates";

export const createUserAccount = async (user: TUser) => {
    //check if user already exists in database
    const existingUser = await prisma.userModel.findUnique({
        where: { email: user.email },
    });
    appAssert(!existingUser, CONFLICT, "User already exists", "409");

    const hashedPassword = await hashPassword(user.password);

    //if not, create a new user in the database
    const newUser = await prisma.userModel.create({
        data: {
            ...user,
            password: hashedPassword,
            role: user.role || "worker",
        },
        select: { email: true, id: true, createdAt: true, name: true },
    });

    return newUser;
};

export const saveRefreshToken = async (token: string, userId: string) => {
    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt: sevenDaysFromNow(),
        },
    });
};

export const getUserProfile = async (userId: string) => {
    const user = await prisma.userModel.findUnique({ 
        where: { id: userId },
        select: { 
            email: true, 
            id: true, 
            createdAt: true, 
            name: true, 
            role: true, 
            isEmailVerified: true,
            logoUrl: true,
            companyAddress: true,
            companyPhone: true,
            defaultCurrencyCode: true,
            defaultCurrencySymbol: true,
            defaultTaxRate: true,
            invoicePrefix: true,
            invoiceSuffix: true,
            invoiceSequenceStart: true,
            invoiceSequenceNext: true
        } 
    });
    //return without sensitive fields(using prisma's inbuilt functions)
    appAssert(user, UNAUTHORIZED, "User not found");
    return user;
};

export const verifyRefreshTokenInDB = async (token: string) => {
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token },
    });

    console.log("This is the storedToken: ", storedToken);
    // Ensure the token exists
    appAssert(storedToken, UNAUTHORIZED, "Invalid or expired refresh token");

    // Check if the token is expired
    const isExpired = new Date(storedToken.expiresAt) < new Date();
    console.log("This is the isExpired: ", isExpired);
    appAssert(!isExpired, UNAUTHORIZED, "Refresh token expired");

    return storedToken.userId;
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.userModel.findUnique({ where: { email } });
    appAssert(user, UNAUTHORIZED, "Invalid email or password");

    const isPasswordValid = await comparePasswords(password, user.password);
    appAssert(isPasswordValid, UNAUTHORIZED, "Invalid email or password");
    return user;
};

export const revokeAllRefreshTokensForAUser = async (userId: string) => {
    await prisma.refreshToken.deleteMany({
        where: { userId },
    });
};

export const storeHashedToken = async (
    token: string,
    userId: string,
    expiresAt: Date,
) => {
    await prisma.resetPasswordModel.create({
        data: {
            userId: userId,
            token,
            expiresAt,
        },
    });
};

export const verifyResetPasswordToken = async (token: string) => {
    const resetPasswordToken = await prisma.resetPasswordModel.findUnique({
        where: { token, expiresAt: { gt: new Date() } },
        select: { userId: true, expiresAt: true },
    });

    appAssert(resetPasswordToken, UNAUTHORIZED, `Tokne is not valid`);
    return resetPasswordToken.userId;
};

export const updatePassword = async (userId: string, newPassword: string, currentPassword?: string) => {
    // If currentPassword is provided, verify it first
    if (currentPassword) {
        const user = await prisma.userModel.findUnique({ where: { id: userId } });
        appAssert(user, UNAUTHORIZED, "User not found");
        
        const isCurrentPasswordValid = await comparePasswords(currentPassword, user.password);
        appAssert(isCurrentPasswordValid, UNAUTHORIZED, "Current password is incorrect");
    }
    
    const hashedPassword = await hashPassword(newPassword);
    await prisma.userModel.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });
};
