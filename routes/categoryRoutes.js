import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  categoryController,
  deleteCategoryController,
  getCategoryController,
  singleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";

//router object
const router = express.Router();

router.post("/create-category", requireSignIn, isAdmin, categoryController);
router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);
router.get("/get-category", getCategoryController);
router.get("/single-category/:slug", singleCategoryController);
router.delete(
  "/delete-category/:id",
  requireSignIn,
  isAdmin,
  deleteCategoryController
);

export default router;
