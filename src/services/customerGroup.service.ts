import prisma from "../config/db";
import AppError from "../errors/AppError";
import { NOT_FOUND, UNAUTHORIZED } from "../constants/http";

export const createCustomerGroup = async (
    data: { name: string; description?: string },
    ownerId: string,
) => {
    return prisma.customerGroup.create({
        data: { ...data, ownerId },
    });
};

export const getCustomerGroups = async (ownerId: string) => {
    return prisma.customerGroup.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
    });
};

export const getCustomerGroupById = async (id: string, ownerId: string) => {
    const group = await prisma.customerGroup.findUnique({ where: { id } });
    if (!group || group.ownerId !== ownerId)
        throw new AppError(NOT_FOUND, "Group not found");
    return group;
};

export const updateCustomerGroup = async (
    id: string,
    ownerId: string,
    data: { name?: string; description?: string },
) => {
    const group = await prisma.customerGroup.findUnique({ where: { id } });
    if (!group || group.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.customerGroup.update({ where: { id }, data });
};

export const deleteCustomerGroup = async (id: string, ownerId: string) => {
    const group = await prisma.customerGroup.findUnique({ where: { id } });
    if (!group || group.ownerId !== ownerId)
        throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.customerGroup.delete({ where: { id } });
};

export const assignGroupsToCustomer = async (
    customerId: string,
    groupIds: string[],
    ownerId: string,
) => {
    // Remove all existing memberships for this customer
    await prisma.customerGroupMembership.deleteMany({
        where: { customerId },
    });
    // Add new memberships
    const createData = groupIds.map((groupId) => ({ customerId, groupId }));
    if (createData.length > 0) {
        await prisma.customerGroupMembership.createMany({ data: createData });
    }
    // Return updated memberships
    return prisma.customerGroupMembership.findMany({
        where: { customerId },
        include: { group: true },
    });
};

export const getCustomersByGroup = async (groupId: string) => {
    const memberships = await prisma.customerGroupMembership.findMany({
        where: { groupId },
        include: { customer: true },
    });
    return memberships.map((m: Record<string, any>) => m.customer);
};
