// POST /advertiser/createAd
const createAd = async (req, res) => {
  try {
    const advertiserId = req.advertiser?.id || req.user?.id;
    const isUser = !!req.user;

    const {
      title, description, mediaUrl, clickUrl, adType, cpm,
      dailyBudget, totalBudget, targetCountries, targetLat, targetLng,
      targetRadiusKm, frequencyCap, frequencyCapHours,
    } = req.body;

    // For regular users, skip balance check
    if (!isUser) {
      const { rows: [adv] } = await query(
        `SELECT balance FROM advertisers WHERE id = $1`,
        [advertiserId]
      );
      if (parseFloat(adv.balance) < cpm / 1000) {
        return response.error(res, 'Insufficient balance to create ad. Please fund your account.', 402);
      }
    }

    const { rows: [ad] } = await query(
      `INSERT INTO ads
         (advertiser_id, title, description, media_url, click_url, ad_type, cpm,
          daily_budget, total_budget, target_countries, target_lat, target_lng,
          target_radius_km, frequency_cap, frequency_cap_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        advertiserId, title, description || null, mediaUrl || null, clickUrl || null,
        adType || 'banner', cpm || 1,
        dailyBudget || null, totalBudget || 100,
        targetCountries ? `{${targetCountries.join(',')}}` : '{GH}',
        targetLat || null, targetLng || null, targetRadiusKm || null,
        frequencyCap || 3, frequencyCapHours || 24,
      ]
    );

    logger.info('Ad created', { advertiserId, adId: ad.id });

    return response.created(res, {
      id: ad.id,
      title: ad.title,
      status: ad.status,
      cpm: ad.cpm,
      totalBudget: ad.total_budget,
    }, 'Ad submitted for review.');
  } catch (err) {
    logger.error('createAd error', { error: err.message });
    return response.serverError(res, 'Failed to create ad');
  }
};

// GET /advertiser/ads
const getAds = async (req, res) => {
  try {
    const advertiserId = req.advertiser?.id || req.user?.id;
    const { rows } = await query(
      `SELECT id, title, status, ad_type, cpm, total_budget, total_spent,
              impressions_count, clicks_count, created_at
       FROM ads WHERE advertiser_id = $1 ORDER BY created_at DESC`,
      [advertiserId]
    );
    return response.success(res, { ads: rows });
  } catch (err) {
    return response.serverError(res, 'Failed to fetch ads');
  }
};