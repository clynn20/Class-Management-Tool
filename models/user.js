const { ObjectId } = require('mongodb')
const bcrypt = require("bcryptjs")

const { extractValidFields } = require('../lib/validation')
const { getDbReference } = require('../lib/mongo')

const UserSchema = {
    name: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, required: true }
}

exports.UserSchema = UserSchema

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
    const userToInsert = extractValidFields(user, UserSchema)

    const hash = await bcrypt.hash(userToInsert.password, 8)
    userToInsert.password = hash
    console.log("  -- userToInsert:", userToInsert)

    const db = getDbReference()
    const collection = db.collection('user')
    const result = await collection.insertOne(userToInsert)
    return result.insertedId
}


/*
 * Fetch a user from the DB based on user ID.
 */
async function getUserById (id, includePassword) {
    const db = getDbReference()
    const collection = db.collection('user')
    if (!ObjectId.isValid(id)) {
        return null
    } else {
        const results = await collection
            .find({ _id: new ObjectId(id) })
            .project(includePassword ? {} : { password: 0 })
            .toArray()
        return results[0]
    }
}
exports.getUserById = getUserById

async function getUserByEmail (email, includePassword) {
    const db = getDbReference()
    const collection = db.collection('user')
    
    const results = await collection
        .find({ Email: email })
        .project(includePassword ? {} : { password: 0 })
        .toArray()
    return results[0]
}
exports.getUserByEmail = getUserByEmail

exports.validateUser = async function (email, password) {
    const user = await getUserByEmail(email, true)
    return [user && await bcrypt.compare(password, user.password), user._id]
}