import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
    return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );
};

// Check if we should use Cloudinary (configured and enabled)
export const shouldUseCloudinary = () => {
    const useCloudinary = process.env.USE_CLOUDINARY === 'true';
    const isConfigured = isCloudinaryConfigured();

    if (useCloudinary && !isConfigured) {
        console.warn('⚠️ USE_CLOUDINARY is true but Cloudinary credentials are missing!');
        return false;
    }

    return useCloudinary && isConfigured;
};

// Log configuration status
if (isCloudinaryConfigured()) {
    console.log('✓ Cloudinary configured successfully');
    console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`  Using Cloudinary: ${shouldUseCloudinary()}`);
} else {
    console.log('ℹ️ Cloudinary not configured - using local storage');
}

export default cloudinary;
