import prisma from "../config/db";

export const generateInvoiceNumber = async (ownerId: string) => {
    // Fetch user profile for numbering settings
    const user = await prisma.userModel.findUnique({ where: { id: ownerId } });
    if (!user) throw new Error("User not found for invoice numbering");
    const prefix = user.invoicePrefix || "INV-";
    const suffix = user.invoiceSuffix || "";
    const sequence = user.invoiceSequenceNext || 1;

    // Build invoice number
    const invoiceNumber = `${prefix}${sequence}${suffix}`;

    // Increment sequence for next invoice
    await prisma.userModel.update({
        where: { id: ownerId },
        data: { invoiceSequenceNext: sequence + 1 },
    });

    return invoiceNumber;
};
