import { Router } from 'express';
import { createCampaign, getCampaigns } from '../controllers/campaign.controller';

const router = Router();


router.get('/', getCampaigns)
router.post('/', createCampaign);


export default router;
