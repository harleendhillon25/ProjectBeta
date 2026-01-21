const logger = (req, res, next) => {
    console.log(req.method, req.originalURL);  // GET 
    next()
}

module.exports = logger;