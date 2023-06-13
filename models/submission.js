const { getDbReference } = require('../lib/mongo')
const { ObjectId, GridFSBucket } = require('mongodb')
const fs = require('node:fs')
const multer = require('multer')
const crypto = require('crypto')


const fileTypes = {
    'application/pdf': 'pdf',
    'text/plain': 'txt'
}
exports.fileTypes = fileTypes


const SubmissionSchema = {
    assignmentId:{ required: true },
    studentId: { required: true },
    timestamp: { required: true },
    grade: { required: false }
}
exports.SubmissionSchema = SubmissionSchema


const upload = multer({
    storage: multer.diskStorage({
        destination: `${__dirname}/uploads`,
        filename: (req, file, callback) =>{
            const filename = crypto.pseudoRandomBytes(16).toString('hex')
            const extension = fileTypes[file.mimetype]
            callback(null, `${filename}.${extension}`)
        }
    }),
    fileFilter: (req, file, callback) =>{
        callback(null, !!fileTypes[file.mimetype])
    }
})
exports.upload = upload

exports.saveSubmissionFile = function (submission){
    return new Promise ((resolve, reject) =>{
        const db = getDbReference()
        const bucket = new GridFSBucket(db, {bucketName: 'submissions'})
        const metadata = {
            contentType: submission.contentType,
            assignmentId: submission.assignmentId,
            studentId: submission.studentId,
            timestamp: submission.timestamp
        }
        const uploadStream = bucket.openUploadStream(
            submission.filename,
            {metadata: metadata}
        )
        fs.createReadStream(submission.path)
            .pipe(uploadStream)
            .on('error', (err) => {
                reject(err)
            })
            .on('finish', (result)=>{
                resolve(result._id)
            })
    })
}

exports.removeUploadFile = function (file){
    return new Promise((resolve, reject) => {
        fs.unlink(file.path, (err) => {
            if(err){
                reject(err)
            } else {
                resolve()
            }
        })
    })
}