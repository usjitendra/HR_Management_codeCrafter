import performanceModel from "../models/performace.model.js";
import AppError from "../util/appError.js";

// Create Performance
export const createPerformance = async (req, res, next) => {
  try {
      //  console.log(req.body);
      //  console.log("jitenda");
       
      //  return;
       
    const performance = await performanceModel.create(req.body);
    res.status(201).json({
      success: true,
      message: "Performance record created successfully",
      data: performance,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Get All Performances
export const getPerformances = async (req, res, next) => {
  try {
       const {id} =req.params
      //  console.log(id);
      //  return
    const performances = await performanceModel.find({employeeId:id})
      // .populate("employeeId", "name email")
    res.status(200).json({
      success: true,
      data: performances,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Update Performance
export const updatePerformance = async (req, res, next) => {
  try {
        // console.log(req.params.id);
        // console.log(req.body);
        // return;
        

    const updatedPerformance = await performanceModel.findOneAndUpdate(
        {employeeId:req.params.id},
      req.body,
      { new: true, runValidators: true }
    );

    // console.log(updatePerformance);
    // return
    
    if (!updatedPerformance) {
      return next(new AppError("Performance record not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Performance record updated successfully",
      data: updatedPerformance,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Delete Performance
export const deletePerformance = async (req, res, next) => {
  try {
    const deletedPerformance = await performanceModel.findByIdAndDelete(req.params.id);
    if (!deletedPerformance) {
      return next(new AppError("Performance record not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Performance record deleted successfully",
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
