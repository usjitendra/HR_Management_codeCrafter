
import AppError from "../util/appError.js";
import termsModel from "../models/terms&condition/terms&condition.model.js";

// ✅ Add Terms & Conditions
const terms_add = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return next(new AppError("All fields are required"));
    }

    const response = await termsModel.create({
      title,
      description,
    });

    if (response) {
      return res
        .status(200)
        .json({ success: true, response, message: "Terms & Conditions Added Successfully" });
    } else {
      return next(new AppError("Some error occurred", 400));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// ✅ Delete Terms & Conditions
const delete_terms = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await termsModel.findByIdAndDelete(id);
    if (result) {
      return res.status(200).json({ success: true, message: "Terms & Conditions Deleted" });
    } else {
      return next(new AppError("Some error occurred"));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// ✅ Edit Terms & Conditions
const terms_edit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return next(new AppError("All fields are required"));
    }

    const data = await termsModel.findByIdAndUpdate(
      id,
      { title, description },
      { new: true }
    );

    if (data) {
      return res.status(200).json({ success: true, message: "Success", data });
    } else {
      return next(new AppError("Some error occurred"));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

// ✅ Get All Terms & Conditions
const allTerms = async (req, res, next) => {
  try {
    const data = await termsModel.find();
    if (data) {
      return res.status(200).json({ success: true, message: "Success", data });
    } else {
      return next(new AppError("Some error occurred", 404));
    }
  } catch (err) {
    return next(new AppError(err.message, 500));
  }
};

export { terms_add, delete_terms, terms_edit, allTerms };
