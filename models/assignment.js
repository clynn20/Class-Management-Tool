const { ObjectId } = require('mongodb')
const { extractValidFields } = require('../lib/validation')
const { getDbReference } = require('../lib/mongo')



const AssignmentSchema = {
    courseId: { type: String, required: true },
    title: { type: String, required: true },
    points: { type: Number, required: true },
    due: { type: String, required: true }
}
exports.AssignmentSchema = AssignmentSchema



exports.insertNewAssignment = async function (assignment) {
    const assignmentToInsert = extractValidFields(assignment, AssignmentSchema)
    const db = getDbReference()
    const collection = db.collection('assignments')
    const result = await collection.insertOne(assignmentToInsert)
    return result.insertedId
}

exports.getAssignments = async function () {
    const db = getDbReference()
    const collection = db.collection('assignments')
    const results = await collection.find().toArray()
    return results
}