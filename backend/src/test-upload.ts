import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

(async () => {
  try {
    console.log(await cloudinary.api.ping());

    const result = await cloudinary.uploader.upload(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      {
        folder: "test",
        resource_type: "image",
      }
    );

    console.log("UPLOAD SUCCESS");
    console.log(result.secure_url);
  } catch (err: any) {
    console.log("ERROR");
    console.dir(err, { depth: null });
  }
})();