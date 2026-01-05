import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory structure
// On Vercel, use /tmp which is the only writable directory
const uploadDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');
const subdirs = ['documents', 'images', 'temp'];

// Ensure all directories exist
[uploadDir, ...subdirs.map(d => path.join(uploadDir, d))].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Storage configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
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
export const saveBase64Image = (base64Data, fieldName) => {
  try {
    console.log(`saveBase64Image called for field: ${fieldName}`);

    if (!base64Data || !base64Data.startsWith('data:image')) {
      console.log(`saveBase64Image: Invalid or missing base64 data for ${fieldName}`);
      return null;
    }

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

    console.log(`saveBase64Image: Saving to ${filepath}`);

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

// Helper to process uploaded files and return paths
export const processUploadedFiles = (files) => {
  const filePaths = {};

  if (!files) return filePaths;

  Object.keys(files).forEach(fieldName => {
    if (files[fieldName] && files[fieldName][0]) {
      const file = files[fieldName][0];
      // Store relative path for serving via express.static
      filePaths[fieldName] = `/uploads/${file.filename.startsWith('images/') ? '' : 'images/'}${path.basename(file.path)}`;
    }
  });

  return filePaths;
};

// Helper to delete uploaded file
export const deleteUploadedFile = (filepath) => {
  try {
    if (!filepath) return;

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
