import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  braintreePaymentController,
  braintreeTokenController,
  createProductController,
  deleteProductController,
  getProductController,
  getProductPhotoController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";

//router object
const router = express.Router();

router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);
router.get("/get-product", getProductController);

router.get("/get-product/:slug", getSingleProductController);
router.get("/product-photo/:pid", getProductPhotoController);
router.delete(
  "/delete-product/:id",
  requireSignIn,
  isAdmin,
  deleteProductController
);

router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

router.post("/product-filters", productFiltersController);
router.get("/product-count", productCountController);
router.get("/product-list/:page", productListController);
router.get("/search/:keyword", searchProductController);
router.get("/related-products/:pid/:cid", relatedProductController);
router.get("/product-category/:slug", productCategoryController);

//payments
//token
router.get("/braintree/token", braintreeTokenController);

router.post("/braintree/payment", requireSignIn, braintreePaymentController);
export default router;
