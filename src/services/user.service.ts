// Customer Service Functions (stubs)
import { PrismaClient, Customer } from "@prisma/client";
import appAssert from "../utils/appAssert";
import { BAD_REQUEST, NOT_FOUND, CONFLICT } from "../constants/http";
const prisma = new PrismaClient();

export async function createCustomer(data: any): Promise<Customer> {
  // Check for existing email
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  appAssert(!existing, CONFLICT, "A customer with this email already exists.");
  return prisma.customer.create({ data });
}

export async function getCustomers(): Promise<Customer[]> {
  return prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCustomerById(id: string): Promise<Customer> {
  const customer = await prisma.customer.findUnique({ where: { id } });
  appAssert(customer, NOT_FOUND, "Customer not found");
  return customer;
}

export async function updateCustomer(id: string, data: any): Promise<Customer> {
  // Ensure customer exists
  const customer = await prisma.customer.findUnique({ where: { id } });
  appAssert(customer, NOT_FOUND, "Customer not found");
  // If updating email, check for conflicts
  if (data.email && data.email !== customer.email) {
    const existing = await prisma.customer.findUnique({ where: { email: data.email } });
    appAssert(!existing, CONFLICT, "A customer with this email already exists.");
  }
  return prisma.customer.update({ where: { id }, data });
}

export async function deleteCustomer(id: string): Promise<Customer> {
  const customer = await prisma.customer.findUnique({ where: { id } });
  appAssert(customer, NOT_FOUND, "Customer not found");
  return prisma.customer.delete({ where: { id } });
}
