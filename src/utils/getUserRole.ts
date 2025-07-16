import prisma from "../config/db";

export const getUserRole = async (id: string) => {
    const user = await prisma.userModel.findUnique({ where: { id } });
    return user?.role;
};
