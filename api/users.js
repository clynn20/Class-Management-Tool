const { Router } = require('express');

const { validateAgainstSchema, extractValidFields } = require('../lib/validation')

const { UserSchema, LoginSchema, insertNewUser, getUserById, getUserByEmail, getUsers, validateUserEnP, getCourseTeachById } = require('../models/user')

const { generateAuthToken, requireAuthenticationVer1, requireAuthenticationVer2 } = require("../lib/auth")

const router = Router();


// use for quick peak what user we have in db, not the required api endpoint 
router.get('/', async function (req, res, next) {
    const results = await getUsers();
    res.status(200).send(results);
});


// If not provide auth(Bearer) token, only can create normal user with student role
// If provide valid admin auth token, can create all kinds of user 
router.post('/', requireAuthenticationVer1, async function (req, res) {
    if (validateAgainstSchema(req.body, UserSchema)) {
        const user = extractValidFields(req.body, UserSchema)
        if (((user.role == "admin" || user.role == "instructor")) && (req.authUserRole != "admin")){
            res.status(403).send({
                error: "Didn't have valid user permission, only admin user can create admin or instructor"
            }) 
        } else{
            // const duplicatedUser = await getUserByEmail(user.email, false);
            // if (duplicatedUser.length > 0) {
            //     res.status(400).send({
            //         error: "Email is duplicated"
            //     })
            // } else {
                
            // }
            const id = await insertNewUser(user)
            res.status(201).send({ 
                _id: id,
                links: `users/${id}`
            })
        }
    } else {
        res.status(400).send({
            error: "The requested body is not present or did not contain a valid User object"
        })
    }
})

// user login endpoint, generate token for login user
router.post('/login', async function (req, res, next) {
    try{
        if (validateAgainstSchema(req.body, LoginSchema)) {
            const login = extractValidFields(req.body, LoginSchema)
            const [authenticated, user] = await validateUserEnP(login.email, login.password)
            //console.log(authenticated)
                if (authenticated) {
                    const token = generateAuthToken(user._id)
                    res.status(200).send({
                        token: token
                    })
                } else {
                    res.status(401).send({
                        error: "Invalid authentication credentials"
                    })
                }
        } else {
            res.status(400).send({
                error: "Request body requires email and password."
            })
        }
    } catch (err){
        next(err)
    }
})


//
router.get('/:id', requireAuthenticationVer2, async function( req, res, next){
    const id = req.params.id
    const user = await getUserById(id, 1)
    //console.log(user._id)
    if(req.authUserId == id && user._id == id && user.role == "instructor"){
        const courseTeach = await getCourseTeachById (id)
        res.status(200).send({
            user: user,
            courses_list: courseTeach
        })
    }
    // I'll go back to implement this after the post/courses/{id}/students is done
    /*
    else if (req.authUserId == id && user._id == id && user.role == "student"){
        const courseEnroll = await getCourseEnrollById (id) 
        res.status(200).send({
            user: user, 
            courses_list: courseEnroll
        })
    }
    */ 
    else{
        res.status(403).send({
            user: user
        })
    }
})

module.exports = router;
