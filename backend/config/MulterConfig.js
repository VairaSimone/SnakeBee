import multer from 'multer';
import path from 'path';

// create the folder first, e.g. 'uploads/'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique name for the file, e.g. timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // .jpg, .png etc
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo file immagine sono ammessi'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
limits: { fileSize: 15 * 1024 * 1024 } // 15MB
  },
});

export default upload;
