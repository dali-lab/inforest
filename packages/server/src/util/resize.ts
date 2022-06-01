import sharp from "sharp";

export const resizeImage = async (buffer: Buffer) => {
  const largeBuffer = await sharp(buffer)
    .resize(2000)
    .jpeg({ quality: 50 })
    .toBuffer();

  const thumbBuffer = await sharp(buffer)
    .resize(100)
    .jpeg({ quality: 30 })
    .toBuffer();

  return {
    full: {
      key: Date.now().toString() + "_full.jpeg",
      buffer: largeBuffer,
    },
    thumb: {
      key: Date.now().toString() + "_thumb.jpeg",
      buffer: thumbBuffer,
    },
  };
};
