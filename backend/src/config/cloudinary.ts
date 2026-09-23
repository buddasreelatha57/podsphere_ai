import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

const cloudinaryConfigs = [
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  },
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_2,
    api_key: process.env.CLOUDINARY_API_KEY_2,
    api_secret: process.env.CLOUDINARY_API_SECRET_2,
  },
  {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME_3,
    api_key: process.env.CLOUDINARY_API_KEY_3,
    api_secret: process.env.CLOUDINARY_API_SECRET_3,
  }
].filter(config => config.cloud_name && config.api_key && config.api_secret);

if (cloudinaryConfigs.length > 0) {
  cloudinary.config(cloudinaryConfigs[0] as any);
}

export const getActiveCloudinaryConfig = async () => {
  if (cloudinaryConfigs.length === 0) {
    throw new Error("Cloudinary is not configured. Add credentials to the backend environment.");
  }

  for (const config of cloudinaryConfigs) {
    try {
      cloudinary.config(config as any);
      const usage = await cloudinary.api.usage();
      const storageLimit = usage?.storage?.limit || 0;
      const storageUsage = usage?.storage?.usage || 0;
      const usagePercentage = storageLimit > 0 ? (storageUsage / storageLimit) * 100 : 0;

      if (usagePercentage < 90 || storageLimit === 0) {
        return config;
      }

      console.log(`[Cloudinary] Account ${config.cloud_name} is ${usagePercentage.toFixed(2)}% full. Falling back to next account.`);
    } catch (error) {
      console.warn(`[Cloudinary] Failed to check usage for ${config.cloud_name}:`, error);
    }
  }

  console.warn("[Cloudinary] All configured accounts failed or are near limit. Falling back to the first configured account.");
  return cloudinaryConfigs[0];
};

export default cloudinary;
