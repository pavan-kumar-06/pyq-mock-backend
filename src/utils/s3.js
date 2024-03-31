import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

import sharp from 'sharp';

import { ApiError } from "./ApiError.js";

// const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})

const uploadS3 = async (localFilePath, bucketName, key, contentType) => {
    try {
        // console.log("Insied s3 fucntion")
        // console.log(localFilePath,bucketName,key,contentType)
        // Read the file from the local file system
        // const fileData = fs.readFileSync(localFilePath);

        // Resize and compress image using sharp
        const fileExtension = key.split('.').pop().toLowerCase();
        // Check file extension
        if (fileExtension !== 'jpg' && fileExtension !== 'jpeg' && fileExtension !== 'png') {
            // If the file extension is not JPEG or PNG, don't save and return an error
            throw new ApiError(400, "Unsupported file format. Only JPEG and PNG files are allowed");
        }

        const  compressedImageBuffer = await sharp(localFilePath)
                .resize({ 
                    width: 700, 
                    height: 700 ,
                    fit: 'inside', // Resize the image to fit within 400x400 pixels without cropping
                    withoutEnlargement: true // Don't enlarge the image if its dimensions are already smaller than 400x400 pixels
                })
                // .jpeg({ quality: 50 }) // Adjust quality as needed
                .toBuffer();
        
        if(!compressedImageBuffer){
            throw new ApiError(500,"Error while compressing the file")
        }

        // Set up parameters for S3 upload
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: compressedImageBuffer,
            ContentType: contentType // Set content type as needed
        };
        
        // Create a command to upload the file to S3
        const command = new PutObjectCommand(params);
        
        // Upload the file to S3
        const response = await s3.send(command);
        // console.log("File uploaded successfully:", response);
        
        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        
        return response;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        // Remove the locally saved temporary file
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteS3 = async (bucketName, key ) => {
    try {
        // Set up parameters for the delete operation
        const params = {
            Bucket: bucketName, // Specify your S3 bucket name
            Key: key // Specify the key (filename) of the object to delete
        };

        // Create a command to delete the object from S3
        const command = new DeleteObjectCommand(params);

        // Delete the object from S3
        const response = await s3.send(command);

        console.log(`Deleted ${key} from S3`);

        return response;
    } catch (error) {
        console.error("Error deleting object from S3:", error);
        return null;
    }
}


export {uploadS3, deleteS3};