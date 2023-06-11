const { getDbReference } = require('../lib/mongo')
const { ObjectId } = require('mongodb')

/*
 * Course schema
 */

const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true }
}
exports.CourseSchema = CourseSchema


exports.getCourseInstructorId = async function (courseId) {
    const db = getDbReference()
    const collection = db.collection('courses')
    const result = await collection.find({ _id: new ObjectId(courseId)}).toArray()
    if(result[0]){
        return result[0].instructorId
    } else {
        return null
    }
}