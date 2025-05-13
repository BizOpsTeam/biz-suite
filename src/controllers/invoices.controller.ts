import { OK, UNAUTHORIZED } from "../constants/http";
import { getInvoices } from "../services/invoices.service";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const getInvoicesHandler = catchErrors(async(req, res) => {
    const ownerId = req.user?.id
    appAssert(ownerId, UNAUTHORIZED, "Unauthorized, login to fetch invoices")

    const invoices = await getInvoices(ownerId)
    return res.status(OK).json({data: invoices, message: "invoices returned successfully"})
})