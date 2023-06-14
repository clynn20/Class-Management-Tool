const { Router } = require('express')
const { validateAgainstSchema, extractValidFields } = require('../lib/validation')
const { requireAuthenticationVer1, requireAuthenticationVer2, getAuthUserRole} = require('../lib/auth')
const { AssignmentSchema, insertNewAssignment, getAssignments, updateAssignmentsById, removeAssignmentsById, getAssignmentById } = require('../models/assignment')
const { getCourseInstructorId, getCourseById, getStudentsByCourseId } = require('../models/course')
const { upload, fileTypes, saveSubmissionFile, removeUploadFile, SubmissionSchema, getSubmissionInfoByAssignmentId} = require('../models/submission')
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
        const course = await getCourseById(req.body.courseId)
        if( ((req.authUserId == instructorId) && course) || ((req.authUserRole == "admin") && course )){
            const result = await insertNewAssignment(assignment)
            res.status(201).send({ _id: result})
        } else {
            res.status(403).send({ 
                error: "No permission to create the assignment or course not exist"
            })
        }
    } else {
        res.status(400).send({ 
            error: "The request body is not a valid assignment object"
        })
    }
});

router.get('/:id', async function (req, res, next){
    try{
        const id = req.params.id
        const assignment =  await getAssignmentById(id, 0)
        if(assignment){
            res.status(200).send(assignment);
        } else{
            res.status(404).send({
                error: "No Assignments found for this id"
            })
        }     
    } catch (err){
        next(err)
    }
})

router.patch('/:id', requireAuthenticationVer1, async function (req, res, next){
    try {
        const assignmentId = req.params.id;
        const assignment = extractValidFields(req.body, AssignmentSchema);

        if (!(req.body && req.body.courseId && ObjectId.isValid(assignmentId) && ObjectId.isValid(req.body.courseId))) {
            return res.status(400).send({ 
                error: "The request body was either not present or did not contain any fields related to Assignment objects"
            })
        }

        const course = await getCourseById(assignment.courseId);
        if (!course) {
            return res.status(404).send({ 
                error: "Specified Course `id` not found"
            })
        }

        if (!(req.authUserRole == "admin" || (req.authUserRole == "instructor" && req.authUserId == course.instructorId))) {
            return res.status(403).send({ 
                error: "The request was not made by an authenticated User satisfying the authorization criteria described above"
            })
        }
        
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
});

router.delete('/:id', async function (req, res, next){

    try {
        const assignmentId = req.params.id;
        if (!ObjectId.isValid(assignmentId)) {
            return res.status(400).send({ 
                error: "The request body was either not present or did not contain any fields related to Assignment objects"
            })
        }
        
        const assignment = await getAssignmentById(assignmentId, false)
        if (!assignment) {
            return res.status(404).send({ 
                error: "Specified Assignment `id` not found"
            })
        }

        const course = await getCourseById(assignment.courseId);
        if (!course) {
            return res.status(404).send({ 
                error: "Specified Course `id` not found"
            })
        }

        if (!(req.authUserRole == "admin" || (req.authUserRole == "instructor" && req.authUserId == course.instructorId))) {
            return res.status(403).send({ 
                error: "The request was not made by an authenticated User satisfying the authorization criteria described above"
            })
        }

        await removeAssignmentsById(assignmentId);
        return res.sendStatus(204).send({ Message: "Success"});
    } catch (error) {
        res.status(500).send({message: error.message});
    }
})

router.get('/:id/submissions', requireAuthenticationVer1, async function (req, res, next){

    try {
        const assignmentId = req.params.id;
        if (!ObjectId.isValid(assignmentId)) {
            return res.status(400).send({ 
                error: "The request body was either not present or did not contain any fields related to Assignment objects"
            })
        }
        
        const assignment = await getAssignmentById(assignmentId, false)
        if (!assignment) {
            return res.status(404).send({ 
                error: "Specified Assignment `id` not found"
            })
        }

        const course = await getCourseById(assignment.courseId);
        if (!course) {
            return res.status(404).send({ 
                error: "Specified Course `id` not found"
            })
        }

        if (!(req.authUserRole == "admin" || (req.authUserRole == "instructor" && req.authUserId == course.instructorId))) {
            return res.status(403).send({ 
                error: "The request was not made by an authenticated User satisfying the authorization criteria described above"
            })
        }

        const submissions = await getSubmissionInfoByAssignmentId(assignmentId);
        if (!submissions) {
            return res.status(404).send({ 
                error: "Specified Assignment `id` not found"
            })
        }

        const response = submissions.map(x => {
            return {
                "id": x._id,
                "filename": x.filename,
                "contentType": x.metadata.contentType,
                "assignmentId": x.metadata.assignmentId,
                "studentId": x.metadata.studentId,
                "timestamp": x.metadata.timestamp,
                // "links": {
                //     "download": "/submissions/media/files" + x._id
                // }
            }
        });

        let page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const lastPage = Math.ceil(response.length / pageSize);
        page = (page < 1) ? 1 : page;
        page = (page > lastPage) ? lastPage : page;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const submissionsPage = response.slice(start, end);

        res.sendStatus(200).send({ Submissions: submissionsPage});

    } catch (error) {
        res.status(500).send({message: error.message});
    }
})

router.post('/:id/submissions', requireAuthenticationVer2, getAuthUserRole, upload.single('file'), async function (req, res, next){
    if(req.file && validateAgainstSchema(req.body, SubmissionSchema)){
        const id = req.params.id  
        const assignment = await getAssignmentById(id, 1)
        if (assignment){
            const students = await getStudentsByCourseId(assignment.courseId)
            //console.log("--students:", students)
            if(req.authUserId == req.body.studentId && req.authUserRole == 'student' && students.includes(req.body.studentId) && assignment._id == id && id == req.body.assignmentId){
                const submission = {
                    contentType: req.file.mimetype,
                    filename: req.file.filename,
                    path: req.file.path,
                    assignmentId: req.body.assignmentId,
                    studentId: req.body.studentId,
                    timestamp: req.body.timestamp
                }
                const id = await saveSubmissionFile(submission)
                await removeUploadFile(req.file)
                res.status(201).send({ _id:id })
            } else{
                res.status(403).send({
                    error: "Not an authenticated user, you don't have permission"
                })
            }
        } else {
            res.status(404).send({
                error: "No such assignment found"
            })
        }
    } else{
        res.status(400).send({
            error: "Not a valid request body or submission object"
        })
    }   
})

module.exports = router;
