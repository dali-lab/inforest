import { S3 } from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const ID = process.env.ACCESS_ID;
const SECRET = process.env.ACCESS_SECRET;
const BUCKET_NAME = process.env.BUCKET_NAME;

const s3 =
  ID && SECRET
    ? new S3({
        accessKeyId: ID,
        secretAccessKey: SECRET,
      })
    : null;

export const uploadImage = async ({ key, buffer }: any) => {
  if (!s3 || !BUCKET_NAME) throw new Error("Image upload not properly set up.");
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
  };
  return await s3
    .upload(params)
    .promise()
    .then((data) => {
      return data.Location;
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
