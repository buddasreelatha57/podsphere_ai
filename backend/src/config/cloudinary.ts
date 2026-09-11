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

// Set default config to the first available one
if (cloudinaryConfigs.length > 0) {
  cloudinary.config(cloudinaryConfigs[0] as any);
}

export const getActiveCloudinaryConfig = async () => {
  for (const config of cloudinaryConfigs) {
    try {
      // Temporarily configure cloudinary to check usage for this account
      cloudinary.config(config as any);
      const usage = await cloudinary.api.usage();
      
      const usagePercentage = (usage.storage.usage / usage.storage.limit) * 100;
      
      if (usagePercentage < 90) {
        return config;
      }
      
      console.log(`[Cloudinary] Account ${config.cloud_name} is ${usagePercentage.toFixed(2)}% full. Falling back to next account.`);
    } catch (error) {
      console.error(`[Cloudinary] Failed to check usage for ${config.cloud_name}:`, error);
      // Fallback to next on error
    }
  }
  
  console.error("[Cloudinary] All configured accounts are over 90% full or failed. Using the last configured account as a desperate fallback.");
  return cloudinaryConfigs[cloudinaryConfigs.length - 1]; // Fallback to the last one
};

export default cloudinary;
