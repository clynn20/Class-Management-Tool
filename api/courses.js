const { Router } = require('express');
const { ObjectId } = require('mongodb');

const { validateAgainstSchema } = require('../lib/validation')
const { getDbReference } = require('../lib/mongo');
const { CourseSchema } = require('../models/course');

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

router.post('/:id/students', async (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.get('/:id/roster', async (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.get('/:id/assignments', async (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

module.exports = router;
