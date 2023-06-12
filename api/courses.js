const { Router } = require('express');
const { ObjectId } = require('mongodb');

const { validateAgainstSchema } = require('../lib/validation')
const { getDbReference } = require('../lib/mongo');
const { CourseSchema, updateCourseById, getCourseInstructorId, getCourseById } = require('../models/course');
const { getUserByEmail, getUserById} = require('../models/user');

const {requireAuthenticationVer1, requireAuthenticationVer2 } = require("../lib/auth")

const router = Router();

router.get('/', async (req, res, next) => {
    const db = getDbReference();
    const collection = db.collection('courses')
    try {
        const courses = await collection.find().toArray()
        if (courses.length > 0) {
            res.status(200).send(courses)
        } else {
            next()
        }
    } catch (err) {
        next(err)
    }
});

router.post('/', async (req, res, next) => {
    if (validateAgainstSchema(req.body, CourseSchema)) {
        try {
            const course = req.body
            const db = getDbReference()
            const collection = db.collection('courses')
            const result = await collection.insertOne(course)
            const returnedId = result.insertedId
            res.status(201).send({
                id: returnedId
            })
        } catch (err) {
            next(err)
        }
    } else {
        res.status(400).send({
            error: "Request body is not a valid course object."
        })
    }
});

router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const db = getDbReference()
        const collection = db.collection('courses')
        const course = await collection.findOne({
            _id: new ObjectId(id)
        })
        if (course) {
            res.status(200).send(course)
        } else {
            next()
        }
    } catch(err) {
        next(err)
    }
});

router.patch('/:id', async (req, res, next) => {
    const id = req.params.id
    const updatedFields = req.body
    try {
        const db = getDbReference()
        const collection = db.collection('courses')
        const course = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedFields }
        )
        if (course.modifiedCount > 0) {
            res.status(200).send({ message: 'Course updated successfully' })
        } else {
            next() 
        }
    } catch (err) {
        next(err)
    }
});

router.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const db = getDbReference()
        const collection = db.collection('courses')
        const deletedCourse = await collection.deleteOne(
            { _id: new ObjectId(id) }
        )
        if (deletedCourse.deletedCount > 0) {
            res.status(200).send({ message: 'Course deleted successfully' })
        } else {
            next()
        }
    } catch (err) {
        next(err)
    }
});

router.get('/:id/students', async (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.post('/:id/students', requireAuthenticationVer1,async(req,res,next)=>{
    console.log("req.body",req.body)
    //const auth = await getUserByEmail(req.user)
    const instructorid = await getCourseInstructorId(req.params.id)
    console.log("instructorid",instructorid)
    console.log("req.params.id",req.params.id)
    const course = await getCourseById(req.params.id)
    console.log("course", course)
    const add = req.body.add
    console.log("add",add)
    const remove = req.body.remove
    console.log("remove",remove)
    let studentList = []

    for(let i = 0; i<add.length; i++){
        studentList.push(add[i])
    }
    studentList = studentList.filter(id => !remove.includes(id))
    console.log("studentList",studentList)

    if(req.authUserRole == 'admin' || (req.authUserRole == 'instructor' && req.authUserId == instructorid)){
        if(course){
            const resBody = {
                _id: course._id,
                subject:course.subject,
                number: course.number,
                title: course.title,
                term: course.term,
                instructorId: course.instructorId,
                studentsId: studentList
            }    
            if(validateAgainstSchema(resBody, CourseSchema)){
                const result = updateCourseById(course._id, resBody)
                res.status(200).send({
                    resBody
                })
            }
            else{
                res.status(400).send({
                    error: "check the require field again."
                })
            }
        }
        else{
            res.status(404).send({
                error:"	Specified Course id not found."
            })
        }
    }
    else{
        res.status(403).send({
            error:"The request couldn't  made by an authenticated User"
        })
    }

})

router.get('/:id/roster', async (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.get('/:id/assignments', async (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

module.exports = router;
