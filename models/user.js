const { ObjectId } = require('mongodb')
const bcrypt = require("bcryptjs")
const { extractValidFields } = require('../lib/validation')
const { getDbReference } = require('../lib/mongo')

const UserSchema = {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum:["admin", "instructor", "student"] }
}
exports.UserSchema = UserSchema

const LoginSchema = {
    email: {required: true },
    password: {required: true}
}
exports.LoginSchema = LoginSchema

// Get all users
exports.getUsers = async function (){
        const db = getDbReference()
        const collection = db.collection('users')
        const results = await collection.find().toArray()
        return results
}


/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, UserSchema)
    //console.log("  -- userToInsert:", userToInsert)
    const db = getDbReference()
    const collection = db.collection('users')
    const result = await collection.insertOne(userToInsert)
    return result.insertedId
}


/*
 * Fetch a user from the DB by id.
 */

async function getUserById(id, includePassword) {
    const db = getDbReference()
    const collection = db.collection('users')
    const projection = includePassword ? {} : { password: 0 }
  
    if (!ObjectId.isValid(id)) {
      return null
    }
  
    const result = await collection
      .find({ _id: new ObjectId(id) })
      .project(projection)
      .toArray()

    return result[0];
}
exports.getUserById = getUserById

async function getUserByEmail (email, includePassword) {
    const db = getDbReference()
    const collection = db.collection('users')
    const projection = includePassword ? {} : { password: 0}
    const result = await collection.find({ email: email }).project(projection).toArray()
    if (result[0]){
        return result[0]
    }
    else {
        return null
    }
}
exports.getUserByEmail = getUserByEmail


exports.validateUserEnP = async function (email, password) {
    const user = await getUserByEmail(email, 1)
    const authenticated = user && user.password == password
    return [authenticated, user]
}


exports.getCourseTeachById = async function (id) {
        const db = getDbReference()
        const collection = db.collection('courses')
        const results = await collection.find({ instructorId: id}).toArray()
        if(results){
            return results
        } else{
            return null
        }
}

/*
exports.getCourseEnrollById = async function (id) {
    const db = getDbReference()
    const collection = db.collection('courses')
}
*/