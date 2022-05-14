import sharp from "sharp";

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

export const imageResize = async (req: any, res: any, next: any) => {
  const images: ImageObject[] = [];

  if (!req.files) res.status(400).send("No files sent");
  else {
    const resizePromises = req.files.map(async (file: any) => {
      // TODO: error handling for sharp calls?
      const largeBuffer = await sharp(file.buffer)
        .resize(2000)
        .jpeg({ quality: 50 })
        .toBuffer();

      const thumbBuffer = await sharp(file.buffer)
        .resize(100)
        .jpeg({ quality: 30 })
        .toBuffer();

      images.push({
        full: {
          key: Date.now().toString() + "_full.jpeg",
          buffer: largeBuffer,
        },
        thumb: {
          key: Date.now().toString() + "_thumb.jpeg",
          buffer: thumbBuffer,
        },
      });
    });

    await Promise.all([...resizePromises]);

    req.images = images;

    next();
  }
};
