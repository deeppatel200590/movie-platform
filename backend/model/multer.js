import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.js";

// ✅ Create storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "movies",
    resource_type: "auto",
  },
});

// ✅ Use storage
const upload = multer({ storage });

export default upload;