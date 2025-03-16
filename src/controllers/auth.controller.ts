import { CREATED } from "../constants/http";
import { createUserAccount } from "../services/user.service";
import catchErrors from "../utils/catchErrors";
import { userSchema } from "../zodSchema/user.zodSchema";

export const registerHandler = catchErrors(async(req, res) => {
    const { body } = req
    //validate request body
    const validatedUser = userSchema.parse(body)
    //call service to create a new user in the database
    const newUser = await createUserAccount(validatedUser)
    //send a response with the created user
    res.status(CREATED).json({ data: newUser, message: 'User registered successfully' })
})