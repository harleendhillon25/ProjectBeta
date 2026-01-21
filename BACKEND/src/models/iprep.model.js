/**So this model will take from the detectionService.js file a cleaned JSON, 
 * and place it into the ip_reputation table in setup.sql
 */

const db = require("../db/connect.js") //I think, need to check this is the right syntax

async function updateIPReputation(record) {
    const {
        ipAddress,
        abuseConfidenceScore,
        usageType,
        countryName,
        totalReports,
        lastReportedAt,
        checkedAt
    } = record; //breaks down the Json into it's separate functions (like a class)

    const result = await db.query(
        `
        INSERT INTO ip_reputation (
        ip_address,
        abuse_confidence,
        usage_type,
        country_name,
        total_reports,
        last_reported_at,
        checked_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (ipAddress)
        DO UPDATE SET
            abuse_confidence = EXCLUDED.abuse_confidence,
            usage_type = EXCLUDED.usage_type
            country_name = EXCLUDED.country_name,
            total_reports = EXCLUDED.total_reports,
            last_reported_at = EXCLUDED.last_reported_at,
            checked_at = EXCLUDED.checked_at
        RETURNING *;
        `,
        [
            ipAddress,
            abuseConfidenceScore,
            usageType,
            countryName,
            totalReports,
            lastReportedAt,
            checkedAt
        ]
    )

    return result.rows[0]
}

module.exports = {
    updateIPReputation
};