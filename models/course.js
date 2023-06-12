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

exports.updateCourseById = async function (id, course) {
    const db = getDbReference()
    const collection = db.collection('courses')

    if (ObjectId.isValid(id)) {
        const result = await collection.update({ _id: new ObjectId(id) }, { $set: course }).toArray()
        return result.matchedCount > 0 
    } else {
        return null
    }
}

exports.getCourseById = async function (id) {
    const db = getDbReference()
    const collection = db.collection('courses')

    if(ObjectId.isValid(id)){
        const results = await collection.find({ _id: new ObjectId(id) }).toArray()
        //console.log(results)
        //console.log(results[0])
        console.log("--resuts:", results[0])
        return results[0]
    } else {
        return null
    }

}
