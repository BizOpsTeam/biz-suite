import { Router } from "express";
import {
    updateUserProfileHandler,
    uploadLogoHandler,
} from "../controllers/user.controller";
import { getUserProfile } from "../services/auth.service";
import catchErrors from "../utils/catchErrors";
import appAssert from "../utils/appAssert";
import { UNAUTHORIZED } from "../constants/http";

const router = Router();

// User profile routes (accessible to all authenticated users)
router.get("/profile", catchErrors(async (req, res) => {
    const userId = req.user?.id;
    appAssert(userId, UNAUTHORIZED, "Unauthorized");
    const user = await getUserProfile(userId);
    res.status(200).json({ success: true, data: user, message: "User profile fetched successfully" });
}));

router.patch("/profile", updateUserProfileHandler);
router.post("/profile/logo", uploadLogoHandler);

export default router; 