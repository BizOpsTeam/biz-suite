
import { Request, Response, NextFunction } from "express";
import { createCustomerSchema, updateCustomerSchema } from "../zodSchema/user.zodSchema";
import { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../services/user.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";


export const createCustomerHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const validated = createCustomerSchema.parse(req.body);
  const customer = await createCustomer(validated);
  res.status(201).json({ success: true, data: customer });
});

export const getCustomersHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const customers = await getCustomers();
  res.json({ success: true, data: customers });
});

export const getCustomerByIdHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const customer = await getCustomerById(id);
  if (customer == null) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }
  res.json({ success: true, data: customer });
});

export const updateCustomerHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const validated = updateCustomerSchema.parse(req.body);
  const customer = await updateCustomer(id, validated);
  if (customer == null) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }
  res.json({ success: true, data: customer });
});

export const deleteCustomerHandler = catchErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const customer = await deleteCustomer(id);
  if (customer == null) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }
  res.json({ success: true, message: "Customer deleted" });
});



