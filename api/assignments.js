const { Router } = require('express')
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { requireAuthenticationVer1} = require('../lib/auth')
const { AssignmentSchema, insertNewAssignment, getAssignments } = require('../models/assignment')
const { getCourseInstructorId } = require('../models/course')
const router = Router();

router.get('/', async function (req, res, next) {
    const results = await getAssignments()
    res.status(200).send(results)
});

router.post('/', requireAuthenticationVer1, async function(req, res, next) {
    if(validateAgainstSchema(req.body, AssignmentSchema)){
        const assignment = extractValidFields(req.body, AssignmentSchema)
        const instructorId = await getCourseInstructorId(assignment.courseId)
        //console.log(instructorId)
        //console.log(req.authUserRole)
        //console.log(req.authUserId)
        if(req.authUserId == instructorId || req.authUserRole == "admin" ){
            const result = await insertNewAssignment(assignment)
            res.status(201).send({ _id: result})
        } else {
            res.status(403).send({ 
                error: "No permission to create the assignment"
            })
        }
    } else {
        res.status(400).send({ 
            error: "The request body is not a valid assignment object"
        })
    }
});

router.get('/:id', async function (req, res, next){
    res.sendStatus(200);
})

router.patch('/:id', async function (req, res, next){
    res.sendStatus(200);
})

router.delete('/:id', async function (req, res, next){
    res.sendStatus(200);
})

router.get('/:id/submissions', async function (req, res, next){
    res.sendStatus(200);
})

router.post('/:id/submission', async function (req, res, next){
    res.sendStatus(200);
})

module.exports = router;
