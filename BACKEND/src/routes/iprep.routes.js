//This is where the refresh request will get sent to and this will push it to the correct controller

const express = require("express")
const refresh_ip_reputation = require("../controllers/iprep.controller.js")

const router = express.Router()

router.post("/refresh", refresh_ip_reputation) //the /refresh can change if needed

module.exports = router;