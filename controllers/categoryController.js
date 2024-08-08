import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";

export const categoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(404).send({ message: "Name is required" });
    }
    const existingUser = await categoryModel.findOne({ name });
    if (existingUser) {
      return res
        .status(200)
        .send({ success: true, message: "Category already exists" });
    }
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    return res.status(201).send({
      category,
      success: true,
      message: "Category Created",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Something Went Wrong",
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );
    return res
      .status(200)
      .send({ message: "Category Updated", success: true, category });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "SomeThing went wrong",
      success: false,
    });
  }
};

export const getCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    return res.status(200).send({
      message: "All categories List",
      success: true,
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Error while getting all the categories",
    });
  }
};

export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (category) {
      return res.status(200).send({
        message: "get Single Category Successfully",
        success: true,
        category,
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "Invalid Slug",
      });
    }
    return;
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while getting single Category",
      error,
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (deletedCategory) {
      return res.status(200).send({
        message: "Category deleted Successfully",
        success: true,
      });
    } else {
      return res.status(404).send({
        message: "Invalid Category Id",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Error while deleting the Category",
      error,
    });
  }
};
