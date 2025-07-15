
import { Request, Response, NextFunction } from "express";
import { createCustomerSchema, updateCustomerSchema } from "../zodSchema/user.zodSchema";
import { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } from "../services/user.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";


export async function createCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = createCustomerSchema.parse(req.body);
    const customer = await createCustomer(validated);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
}

export async function getCustomersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const customers = await getCustomers();
    res.json({ success: true, data: customers });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customer = await getCustomerById(id);
    if (customer == null) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validated = updateCustomerSchema.parse(req.body);
    const customer = await updateCustomer(id, validated);
    if (customer == null) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const customer = await deleteCustomer(id);
    if (customer == null) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
}



