const { Router } = require('express');

const { validateAgainstSchema } = require('../lib/validation')
const {
    UserSchema,
    insertNewUser,
    getUserById,
    getUserByEmail,
    validateUser
} = require('../models/user')
const { generateAuthToken, requireAuthentication } = require("../lib/auth")

const router = Router();

router.get('/', (req, res, next) => {
    res.sendStatus(200);
});

router.post('/', async function (req, res) {
    if (validateAgainstSchema(req.body, UserSchema)) {
        const user = await getUserByEmail(req.body.email, false);
        if (!user) {
            if (req.body.role != "A" && req.body.role != "I") {
                try {
                    const id = await insertNewUser(req.body)
                    res.status(201).send({ message: "New User successfully added.", _id: id })
                } catch (e) {
                    next(e)
                }
            }else{
                if (req.isAdmin) {
                    try {
                        const id = await insertNewUser(req.body)
                        res.status(201).send({ message: "New User successfully added.", _id: id })
                    } catch (e) {
                        next(e)
                    }
                }else{
                    res.status(403).send({ message : "The request was not made by an authenticated User satisfying the authorization criteria described above."});
                }
            }
        }else{
            res.status(400).send({
                error: "The request body was either not present or did not contain a valid User object."
            })
        }
    } else {
        res.status(400).send({
            error: "The request body was either not present or did not contain a valid User object."
        })
    }
})

router.post('/login', async function (req, res, next) {
    if (req.body && req.body.email && req.body.password) {
        try {
            const [authenticated, userId] = await validateUser(
                req.body.email,
                req.body.password
            )
            if (authenticated) {
                const token = generateAuthToken(userId)
                res.status(200).send({
                    token: token
                })
            } else {
                res.status(401).send({
                    error: "Invalid authentication credentials"
                })
            }
        } catch (e) {
            next(e)
        }
    } else {
        res.status(400).send({
            error: "Request body requires `id` and `password`."
        })
    }
})

module.exports = router;
