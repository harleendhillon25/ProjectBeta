// This will call the IPs from (assuming) the ingest.model, and then will post them within the API
require("dotenv").config();  // put this as the first line


//Here will be the requires from the ingest.model (for the IPs) and I assume the iprep.model (to send the response)
const iprepModel = require("../models/iprep.model.js")
const {getDistinctIPs, clearAllLogs } = require("../models/ingest.model.js")

const API_KEY = process.env.ABUSE_KEY 
//Need to put key in .env

//AbuseIPDB CHECK function
async function callAbuseIPDB(ipAddress) {
    console.log(API_KEY)
    if(!API_KEY) {
        throw new Error("You have not provided a valid API key");
    }
    //Mostly following their documentation now
    const url = new URL("https://api.abuseipdb.com/api/v2/check");
    url.searchParams.append("ipAddress", ipAddress)
    url.searchParams.append("maxAgeInDays", "90")
    url.searchParams.append("verbose", "");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Key: API_KEY,
            Accept: "application/json", //They have a comma, check this if it doesn't work
        },
    });

    if(!response.ok) {
        const text = await response.text()
        throw new Error(`AbuseIPDB request has failed for ${ipAddress}. Status: ${response.status}, ${text}`);
    }
    
    const json = await response.json();
    const data = json.data; //So this is the response we want to filter so it can be placed into an SQL table

    return {
        ipAddress: data.ipAddress,
        abuseConfidenceScore: data.abuseConfidenceScore,
        usageType: data.usageType,
        countryName: data.countryName,
        totalReports: data.totalReports,
        lastReportedAt: data.lastReportedAt,
        checkedAt: new Date().toISOString()
    };
}

//Don't think I need this function anymore, as was good for simply testing one, enrich RecentIPs is what it will be using.
// async function enrichIP(ipAddress) {
//     const record = await callAbuseIPDB(ipAddress);

//     const savedRow = await iprepModel.updateIPReputation(record);

//     return savedRow;
// }

//Get the IPs from the injest Model.
async function enrichRecentIPs() {
    const ips = await getDistinctIPs() //Currently gets the last 60 minutes worth of IPs in table, can be changed.

    const results = []

    for (const ip of ips) {
        try {
            const record = await callAbuseIPDB(ip)
            const savedRow = await iprepModel.updateIPReputation(record)
            results.push({
                ip,
                status: "ok",
                row: savedRow
            })
        } catch (error) {
            console.error(`Failed to enrich IP ${ip}:`, error.message)
            results.push({
                ip,
                status: "error",
                error: error.message
            })
        }
    }
    
    //Once processed we can clear all the logs
    try {
        await clearAllLogs();
        console.log("Client logs table cleared after refresh")
    } catch (err) {
        console.error("Failed to clear the client logs:", err.message)
    }

    return results;
}
//Quick check to see if it works before I move onto iprepmodel, need terminal access to try this
// if (require.main === module) {
//     (async() => {
//         try {
//             console.log("This shows if it is actually running")
//             const result = await enrichIP("80.94.92.70") //Now testing the full flow as calling enrichIP
//             console.log(result)
//         } catch (err) {
//             console.log(err)
//         }
//     })(); // The () is so the function is actually called. This can be deleted/commented when actually pulling from other models.
// } 

module.exports = {
    callAbuseIPDB,
    enrichRecentIPs
}