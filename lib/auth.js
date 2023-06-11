const jwt = require("jsonwebtoken")
const secretKey = "SuperSecret"
const { getUserById } = require('../models/user')

exports.generateAuthToken = function (id) {
    const payload = { sub: id }
    return jwt.sign(payload, secretKey, { expiresIn: "24h" })
}

exports.requireAuthenticationVer1 = async function (req, res, next) {
    //console.log("== requireAuthentication()")
    const authHeader = req.get("Authorization") || ""
    const authHeaderParts = authHeader.split(" ")
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
    //console.log("  -- token:", token)
    if(token){
        try {
            const payload = jwt.verify(token, secretKey)
            //console.log("  -- payload:", payload)
            const user = await getUserById(payload.sub, 0)
            req.authUserId = payload.sub
            req.authUserRole = user.role
            next()
        } catch (err) {
            console.error("== Error verifying token:", err)
            res.status(401).send({
                error: "Invalid authentication token"
            })
        }
    } else{
        next()
    }
}

exports.requireAuthenticationVer2 = async function( req, res, next ){
    const authHeader = req.get("Authorization") || ""
    const authHeaderParts = authHeader.split(" ")
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
    try {
        const payload = jwt.verify (token, secretKey)
        req.authUserId = payload.sub
        next()
    } catch (err){
        res.status(401).send({
            error: "Invalid authentication token"
        })
    }
}