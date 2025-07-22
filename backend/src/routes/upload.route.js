import express from "express";
import cloudinary from "../lib/cloudinary.js";
import asyncHandler from "../lib/utils.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const fileStr = req.body.image;

    if (!fileStr) {
      res.status(400);
      throw new Error("No image uploaded");
    }

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "rewarder",
      resource_type: "auto",
    });

    if (!uploadResponse?.secure_url) {
      res.status(400);
      throw new Error("Image upload failed");
    }

    res.status(200).json({
      message: "Image Uploaded Successfully",
      image: uploadResponse.secure_url,
    });
  })
);

export default router;
