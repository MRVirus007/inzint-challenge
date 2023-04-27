const AWS = require('aws-sdk');
const mongoose = require('mongoose');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const extractFrames = require('ffmpeg-extract-frames');
const fs = require('fs');
require('dotenv').config();
// Set up Mongoose connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Define Mongoose schema for videos
const videoSchema = new mongoose.Schema({
    thumb_url: String,
    video_url: String
});
const Video = mongoose.model('Video', videoSchema);

// Initialize S3 and set up source and destination buckets
const s3 = new AWS.S3();

const destBucket = 'thumbnailbucket007';

exports.handler = async (event, context) => {
    const srcBucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const fileName = key.split('/').pop().split('.')[0];

    try {
        // Get the URL of the uploaded video
        const videoUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: srcBucket,
            Key: key,
            Expires: 60 * 5 // URL expires in 5 minutes
        });

        // Extract the frame from the video URL
        const outputPath = require('os').tmpdir() + `/${fileName}.png`;
        await extractFrames({
            input: videoUrl,
            output: outputPath,
            offsets: [5000], // Extract frame at 5 seconds
        });

        // Upload the extracted frame to S3
        const thumbnailKey = `${fileName}.png`;
        const thumbnailParams = {
            Bucket: destBucket,
            Key: thumbnailKey,
            Body: fs.createReadStream(outputPath),
            ContentType: 'image/png'
        };
        const thumbnailData = await s3.upload(thumbnailParams).promise();

        // Save the video and thumbnail paths to MongoDB
        await Video.create({
            thumb_url: thumbnailData.Location,
            video_url: `https://${srcBucket}.s3.amazonaws.com/${key}`
        });

        console.log('Video and thumbnail paths saved to MongoDB');
        return {
            statusCode: 200,
            body: JSON.stringify('Image Extraction processing with video upload successful')
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify('Video upload and processing failed')
        };
    }
};
