const express = require("express");
const router = express.Router();
router.use(express.json())
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const app = express();
const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, `${uuidv4()}.${file.originalname.split('.').pop()}`);
        },
    }),
});

router.post('/', upload.single('video'), (req, res) => {
    console.log('File uploaded:', req.file.location);
    res.status(200).json({ message: 'Video uploaded successfully', status: true });
});

module.exports = router;

