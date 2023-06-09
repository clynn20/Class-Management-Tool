const { Router } = require('express');

const { validateAgainstSchema } = require('../lib/validation')

const { getDbReference } = require('../lib/mongo');
const { CourseSchema } = require('../models/course');

const router = Router();

router.get('/', async (req, res, next) => {
    const db = getDbReference()
    const collection = db.collection('courses')
    try {
        const courses = await collection.find().toArray()
        if (courses.length > 0) {
            console.log(courses)
            res.send(courses)
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

router.get('/:id', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.patch('/:id', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.delete('/:id', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.get('/:id/students', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.post('/:id/students', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.get('/:id/roster', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

router.get('/:id/assignments', (req, res, next) => {
    const id = parseInt(req.params.id)
    res.sendStatus(200);
});

module.exports = router;
