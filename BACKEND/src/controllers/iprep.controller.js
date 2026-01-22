//This controller will allow the manual refresh
const {enrichRecentIPs} = require("../services/detectionService.js")

async function refresh_ip_reputation(req, res) {
    try {
        const { window_minutes = 60 } = req.body || {}

        const result = await enrichRecentIPs( { windowMinutes: window_minutes })

        return res.status(200).json({
            success: true,
            message: "IP reputation has been sucessfully refreshed",
            count: result.length,
            data: result
        })
    } catch (error) {
        console.error("An error refreshing the IP reputations has occurred:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to refresh the IP reputation", 
            error: error.message
        })
    }
}

module.exports = {
    refresh_ip_reputation,
}