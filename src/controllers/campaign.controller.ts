import { Request, Response } from 'express';
import { campaignSchema } from '../zodSchema/campaign.zodSchema';
import { CampaignService } from '../services/campaign.service';
import appAssert from '../utils/appAssert';
import catchErrors from '../utils/catchErrors';
import { BAD_REQUEST, CREATED, OK, UNAUTHORIZED } from '../constants/http';

export const createCampaign = catchErrors(async (req: Request, res: Response) => {
    const parseResult = campaignSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(BAD_REQUEST).json({ errors: parseResult.error.flatten() });
    }
    const ownerId = req.user?.id || req.body.ownerId;
    appAssert(ownerId, UNAUTHORIZED, 'Unauthorized');
    
    const campaign = await CampaignService.createCampaign(parseResult.data, ownerId);
    return res.status(CREATED).json({ data: campaign, message: 'Campaign created successfully' });
});


export const getCampaigns = catchErrors(async (req: Request, res: Response) => {
    const ownerId = req.user?.id;
    appAssert(ownerId, UNAUTHORIZED, 'Unauthorized');
    const campaigns = await CampaignService.getCampaigns(ownerId);
    return res.status(OK).json({ data: campaigns, message: 'Campaigns fetched successfully' });
});
