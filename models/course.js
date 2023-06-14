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
    instructorId: { required: true },
    studentsId: {type: Array}
}
exports.CourseSchema = CourseSchema


exports.getCourseInstructorId = async function (courseId) {
    const db = getDbReference()
    const collection = db.collection('courses')
    if(!ObjectId.isValid(courseId)){
        return null
    } else{
        const result = await collection.find({ _id: new ObjectId(courseId)}).toArray()
        return result[0].instructorId
    }
}

exports.updateCourseById = async function (id, course) {
    const db = getDbReference()
    const collection = db.collection('courses')
  
    if (ObjectId.isValid(id)) {
      const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: course })
      return result.matchedCount > 0
    } else {
      return null
    }
  };

exports.getCourseById = async function (id) {
    const db = getDbReference()
    const collection = db.collection('courses')

    if(ObjectId.isValid(id)){
        const results = await collection.find({ _id: new ObjectId(id) }).toArray()
        return results[0]
    } else {
        return null
    }

}

exports.getStudentsByCourseId = async function (courseId){
    const db = getDbReference()
    const collection = db.collection('courses')
    if(ObjectId.isValid(courseId)){
        const results = await collection.find({_id: new ObjectId(courseId)}).toArray()
        if(results[0].studentsId){
            return results[0].studentsId
        } else if(results[0].studentsId === undefined){
            return []
        }
    } else {
        return null
    }
}
