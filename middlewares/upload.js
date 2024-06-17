const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req,file,callback) => {
    const supportedFiles = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (supportedFiles.includes(file.mimetype)) {
      return callback(null, true);
    } else {
      //reject file
      return callback(new Error('Unsupported file format'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: fileFilter,
})

const uploadFiles = upload.array('files');

module.exports = uploadFiles;
