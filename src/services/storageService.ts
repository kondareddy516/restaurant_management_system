/**
 * Firebase Storage Service
 * Handles image uploads and management
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from "firebase/storage";
import { storage } from "../config/firebase";

export const storageService = {
  /**
   * Upload image file
   */
  async uploadImage(file: File, path: string = "menu-items"): Promise<string> {
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${path}/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  },

  /**
   * Get image download URL
   */
  async getImageUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Get image URL error:", error);
      throw error;
    }
  },

  /**
   * Delete image
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Delete image error:", error);
      throw error;
    }
  },
};
