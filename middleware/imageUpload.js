import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cloudinary, { shouldUseCloudinary } from '../config/cloudinaryConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory structure
// On Vercel, use /tmp which is the only writable directory
const uploadDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');
const subdirs = ['documents', 'images', 'temp'];

// Lazy directory initialization to prevent serverless cold start failures
let directoriesInitialized = false;

const ensureDirectories = () => {
  if (directoriesInitialized) return;

  try {
    [uploadDir, ...subdirs.map(d => path.join(uploadDir, d))].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
    directoriesInitialized = true;
  } catch (error) {
    console.error('Failed to create upload directories:', error);
    // Don't throw - allow app to start even if uploads won't work immediately
  }
};

// Storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directories exist before upload
    ensureDirectories();

    let subdir = 'documents';

    // Categorize by file type
    if (file.mimetype.startsWith('image/')) {
      subdir = 'images';
    }

    const destPath = path.join(uploadDir, subdir);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${file.fieldname}-${uniqueSuffix}-${sanitizedName}`;
    cb(null, filename);
  }
});

// Storage for base64 images (from mobile app)
export const saveBase64Image = async (base64Data, fieldName) => {
  try {
    // Ensure directories exist before saving
    ensureDirectories();

    console.log(`saveBase64Image called for field: ${fieldName}`);

    if (!base64Data || !base64Data.startsWith('data:image')) {
      console.log(`saveBase64Image: Invalid or missing base64 data for ${fieldName}`);
      return null;
    }

    // Upload to Cloudinary if configured
    if (shouldUseCloudinary()) {
      try {
        console.log(`Uploading ${fieldName} to Cloudinary...`);

        const uploadResult = await cloudinary.uploader.upload(base64Data, {
          folder: 'loan-management',
          resource_type: 'image',
          public_id: `${fieldName}-${Date.now()}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        });

        console.log(`✓ Uploaded to Cloudinary: ${uploadResult.secure_url}`);
        return uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.error(`Cloudinary upload failed for ${fieldName}:`, cloudinaryError.message);
        console.log('Falling back to local storage...');
        // Fall through to local storage
      }
    }

    // Local storage fallback
    // Extract base64 data
    const matches = base64Data.match(/^data:image\/([a-zA-Z]*);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      console.log(`saveBase64Image: Failed to parse base64 data for ${fieldName}`);
      return null;
    }

    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');

    // Generate filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${fieldName}-${uniqueSuffix}.${imageType}`;
    const filepath = path.join(uploadDir, 'images', filename);

    console.log(`saveBase64Image: Saving to local storage: ${filepath}`);

    // Save file
    fs.writeFileSync(filepath, buffer);

    // Return relative path for database storage
    const relativePath = `/uploads/images/${filename}`;
    console.log(`saveBase64Image: Saved successfully, returning path: ${relativePath}`);
    return relativePath;
  } catch (error) {
    console.error(`Error saving base64 image for ${fieldName}:`, error);
    return null;
  }
};

// Upload file to Cloudinary from local path
export const uploadFileToCloudinary = async (filePath, fieldName) => {
  try {
    if (!shouldUseCloudinary()) {
      return null; // Return null if Cloudinary not configured
    }

    console.log(`Uploading ${fieldName} file to Cloudinary from: ${filePath}`);

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: 'loan-management',
      resource_type: 'image',
      public_id: `${fieldName}-${Date.now()}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    console.log(`✓ Uploaded to Cloudinary: ${uploadResult.secure_url}`);

    // Delete local file after successful upload
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    } catch (deleteError) {
      console.warn(`Could not delete local file: ${filePath}`, deleteError.message);
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error(`Cloudinary upload failed for ${fieldName}:`, error.message);
    return null; // Return null on failure, will use local path
  }
};

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;

  const extname = path.extname(file.originalname).toLowerCase();
  const isImage = allowedImageTypes.test(extname.slice(1)) && file.mimetype.startsWith('image/');
  const isDoc = allowedDocTypes.test(extname.slice(1));

  if (isImage || isDoc) {
    return cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${extname}. Only images (jpeg, jpg, png, gif, webp) and documents (pdf, doc, docx) are allowed.`));
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter,
});

// Multiple file upload fields for loan application
export const loanDocumentUpload = upload.fields([
  { name: 'clientPhoto', maxCount: 1 },
  { name: 'clientAadharFront', maxCount: 1 },
  { name: 'clientAadharBack', maxCount: 1 },
  { name: 'clientPanFront', maxCount: 1 },
  { name: 'guarantorPhoto', maxCount: 1 },
  { name: 'guarantorAadharFront', maxCount: 1 },
  { name: 'guarantorAadharBack', maxCount: 1 },
  { name: 'guarantorPanFront', maxCount: 1 },
  { name: 'productImage', maxCount: 1 },
  { name: 'passbookImage', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 },
]);

// Helper to process uploaded files and upload to Cloudinary if configured
export const processUploadedFiles = async (files) => {
  const filePaths = {};

  if (!files) return filePaths;

  // Process each uploaded file
  for (const fieldName of Object.keys(files)) {
    if (files[fieldName] && files[fieldName][0]) {
      const file = files[fieldName][0];
      const localPath = file.path;

      // Try to upload to Cloudinary
      const cloudinaryUrl = await uploadFileToCloudinary(localPath, fieldName);

      if (cloudinaryUrl) {
        // Use Cloudinary URL
        filePaths[fieldName] = cloudinaryUrl;
      } else {
        // Use local path as fallback
        filePaths[fieldName] = `/uploads/${file.filename.startsWith('images/') ? '' : 'images/'}${path.basename(file.path)}`;
      }
    }
  }

  return filePaths;
};

// Helper to delete uploaded file
export const deleteUploadedFile = (filepath) => {
  try {
    if (!filepath) return;

    // Don't delete Cloudinary URLs
    if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
      return;
    }

    const fullPath = path.join(__dirname, '..', filepath.replace(/^\//, ''));
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default upload;
