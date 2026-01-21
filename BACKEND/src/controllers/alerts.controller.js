import { refresh_Alerts_From_Sources } from "../models/alerts.model";

function to_int(value, fall_back) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fall_back;
}

export async function refresh_and_list_alerts(req, res, next) {
    try {
        const window_minutes = to_int(req.query.window_minutes, 60);
        const failed_threshold = to_int(req.query.failed_threshold, 3);
        const abuse_threshold = to_int(req.query.abuse_threshold, 50);

        const refresh_result = await refresh_Alerts_From_Sources({
            window_minutes,
            failed_threshold,
            abuse_threshold,
        });

        res.status(200).json({
            message: "Alerts refreshed",
            refresh_result,
        });
    } catch (err) {
        next(err);
    }
}