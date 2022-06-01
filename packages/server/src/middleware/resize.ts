import sharp from "sharp";
import { resizeImage } from "../util/resize";

type ImageObject = {
  full: {
    key: string;
    buffer: Buffer;
  };
  thumb: {
    key: string;
    buffer: Buffer;
  };
};

export const resizeMiddleware = async (req: any, res: any, next: any) => {
  const images: ImageObject[] = [];
  if (!req.body.buffer) res.status(400).send("No files sent");
  else {
    const resizePromises = [req.body.buffer].map(async (fileBuffer: any) => {
      images.push(await resizeImage(fileBuffer));
    });

    await Promise.all([...resizePromises]);

    req.images = images;
    delete req.body.buffer;
    next();
  }
};
