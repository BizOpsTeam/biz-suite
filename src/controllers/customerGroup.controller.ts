import { Request, Response } from "express";
import catchErrors from "../utils/catchErrors";
import { customerGroupSchema } from "../zodSchema/customerGroup.zodSchema";
import { customerGroupAssignSchema } from "../zodSchema/customerGroupAssign.zodSchema";
import {
    createCustomerGroup,
    getCustomerGroups,
    getCustomerGroupById,
    updateCustomerGroup,
    deleteCustomerGroup,
    assignGroupsToCustomer,
    getCustomersByGroup,
} from "../services/customerGroup.service";
import { CREATED, OK } from "../constants/http";
import appAssert from "../utils/appAssert";

export const addCustomerGroupHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const data = customerGroupSchema.parse(req.body);
        const group = await createCustomerGroup(data, ownerId);
        res.status(CREATED).json({ data: group, message: "Group created" });
    },
);

export const getCustomerGroupsHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const groups = await getCustomerGroups(ownerId);
        res.status(OK).json({ data: groups, message: "Groups fetched" });
    },
);

export const getCustomerGroupHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { id } = req.params;
        const group = await getCustomerGroupById(id, ownerId);
        res.status(OK).json({ data: group, message: "Group fetched" });
    },
);

export const updateCustomerGroupHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { id } = req.params;
        const data = customerGroupSchema.partial().parse(req.body);
        const group = await updateCustomerGroup(id, ownerId, data);
        res.status(OK).json({ data: group, message: "Group updated" });
    },
);

export const deleteCustomerGroupHandler = catchErrors(
    async (req: Request, res: Response) => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");
        const { id } = req.params;
        await deleteCustomerGroup(id, ownerId);
        res.status(OK).json({ message: "Group deleted" });
    },
);


export const assignGroupsToCustomerHandler = catchErrors(
    async (req: Request, res: Response): Promise<any> => {
        const ownerId = req.user?.id;
        appAssert(ownerId, 401, "Unauthorized");

        const { id: customerId } = req.params;
        const { groupIds } = customerGroupAssignSchema.parse(req.body);

        const memberships = await assignGroupsToCustomer(
            customerId,
            groupIds,
            ownerId,
        );

        return res.status(OK).json({
            data: memberships,
            message: "Groups assigned to customer",
        });
    },
);


export const getCustomersByGroupHandler = catchErrors(
    async (req: Request, res: Response) => {
        const { groupId } = req.query;
        if (!groupId)
            return res.status(400).json({ message: "groupId is required" });
        const customers = await getCustomersByGroup(groupId as string);
        return res.status(OK).json({ data: customers, message: "Customers fetched" });
    },
);
