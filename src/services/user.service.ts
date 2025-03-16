
import { TUser } from "../constants/types";
import prisma from "../config/db";
import appAssert from "../utils/appAssert";
import { CONFLICT } from "../constants/http";
import { hashPassword } from "../utils/bcrypt";

export const createUserAccount = async(user: TUser) => {
    //check if user already exists in database
    const existingUser = await prisma.userModel.findUnique({ where: { email: user.email }});
    appAssert(!existingUser, CONFLICT ,"User already exists", "409")

    //hash the password before storing it in the database
    const hashedPassword = await hashPassword(user.password)
    //if validation fails, throw an error

    //if not, create a new user in the database
    const newUser = await prisma.userModel.create({data: {...user, password: hashedPassword}, select: { email: true, id: true, createdAt: true, name: true}})
    return newUser;
} 