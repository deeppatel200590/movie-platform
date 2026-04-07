import multer from "multer";

// ✅ Use memory storage (required for R2)
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;