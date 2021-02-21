const router = require('express').Router();


/**
 * @swagger
 * /info/RateLimit:
 *   get:
 *     description: View your rate limit
 *     tags: [Info]
 *     parameters:
 *       - name: key
 *         in: query
 *         type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 */
router.get('/RateLimit', (req, res) => {
    if (req.keyData) {
        res.status(200).json({
            type: 'key',
            max: req.keyData.ratelimit.max,
            used: req.keyData.ratelimit.used
        });
    } else {
        const allEnd = [];
        for (let val of req.endPoints) {
            allEnd.push({ endPoint: val[0], max: val[1].max, used: val[1].used })
        };

        return res.status(200).json({
            type: 'shared',
            endPoints: allEnd
        });
    };
});


module.exports = {
    end: '/info/',
    router,
};