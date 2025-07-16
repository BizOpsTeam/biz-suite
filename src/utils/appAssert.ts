import { HttpStatusCode } from "../constants/http";
import AppError from "../errors/AppError";

/**
 * Asserts a condition and throws an AppError if the condition is falsy.
 */
const appAssert: (
    condition: unknown,
    statusCode: HttpStatusCode,
    message: string,
    errorCode?: string,
) => asserts condition = (condition, statusCode, message, errorCode) => {
    if (!condition) {
        throw new AppError(statusCode, message, errorCode);
    }
};

export default appAssert;
