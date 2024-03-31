import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })

// Define file filter function to allow only .png and .jpeg files
const fileFilter = function (req, file, cb) {
  const allowedTypes = ['.png', '.jpg', '.jpeg'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(fileExtension)) {
      cb(null, true); // Accept the file
  } else {
      cb(new Error('Only .png, .jpg, and .jpeg files are allowed')); // Reject the file
  }
};

  
export const upload = multer({ 
    storage, 
    fileFilter
})