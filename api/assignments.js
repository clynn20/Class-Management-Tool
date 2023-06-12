const { Router } = require('express')
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { requireAuthenticationVer1} = require('../lib/auth')
const { AssignmentSchema, insertNewAssignment, getAssignments, updateAssignmentsById, removeAssignmentsById } = require('../models/assignment')
const { getCourseInstructorId, getCourseById } = require('../models/course')
const { ObjectId } = require('mongodb')
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

router.patch('/:id', requireAuthenticationVer1, async function (req, res, next){
    const assignmentId = req.params.id;
    if (req.body && req.body.courseId && ObjectId.isValid(assignmentId) && ObjectId.isValid(req.body.courseId)) {
        const assignment = extractValidFields(req.body, AssignmentSchema);
        const course = await getCourseById(assignment.courseId);
        if (req.authUserRole == "admin" || (req.authUserRole == "instructor" && req.authUserId == course.instructorId)) {
            try {
                const result = await updateAssignmentsById(assignment, assignmentId);
                if (result) {
                    res.sendStatus(200).send({ Message: "Success"});
                } else {
                    res.status(404).send({ 
                        error: "Specified Assignment `id` not found"
                    })
                }
            } catch (error) {
                res.status(500).send({message: error.message});
            }
        }else{
            res.status(403).send({ 
                error: "The request was not made by an authenticated User satisfying the authorization criteria described above"
            })
        }
    } else {
        res.status(400).send({ 
            error: "The request body was either not present or did not contain any fields related to Assignment objects"
        })
    }
});

router.delete('/:courseId/:assignmentId', async function (req, res, next){
    const assignmentId = req.params.assignmentId;
    const courseId = req.params.courseId;
    if (ObjectId.isValid(assignmentId) && ObjectId.isValid(courseId)) {
        // const assignment = extractValidFields(req.body, AssignmentSchema);
        const course = await getCourseById(courseId);
        if (req.authUserRole == "admin" || (req.authUserRole == "instructor" && req.authUserId == course.instructorId)) {
            try {
                const result = await removeAssignmentsById(assignmentId);
                if (result) {
                    res.sendStatus(204).send({ Message: "Success"});
                } else {
                    res.status(404).send({ 
                        error: "Specified Assignment `id` not found"
                    })
                }
            } catch (error) {
                res.status(500).send({message: error.message});
            }
        }else{
            res.status(403).send({ 
                error: "The request was not made by an authenticated User satisfying the authorization criteria described above"
            })
        }
    } else {
        res.status(400).send({ 
            error: "The request body was either not present or did not contain any fields related to Assignment objects"
        })
    }
})

router.get('/:id/submissions', async function (req, res, next){
    res.sendStatus(200);
})

router.post('/:id/submission', async function (req, res, next){
    res.sendStatus(200);
})

module.exports = router;
