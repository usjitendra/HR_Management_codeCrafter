import ProfileModel from "../models/companyProfile/profile.model.js";

// ========== GET CONTROLLER ==========

// GET - Get all profiles or single profile by ID
export const getProfiles = async (req, res) => {
    try {
        

        // Get only the first profile (latest one due to sort)
        const profiles = await ProfileModel.find().limit(1);

        console.log(profiles);
        

        return res.status(200).json({
            success: true,
            message: "first-profile",
            data: profiles[0] || {}
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error fetching profile"
        });
    }
};

// ========== ADD CONTROLLER ==========

// POST - Create new profile
export const addProfile = async (req, res) => {
    try {
        const profileData = req.body;
        
        // Validate required fields
        // if (!profileData.companyName) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Company name is required"
        //     });
        // }
        
        const newProfile = new ProfileModel(profileData);
        const savedProfile = await newProfile.save();
        
     
      
        

        return res.status(201).json({
            success: true,
            data: savedProfile,
            message: "Profile created successfully"
        });
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error creating profile"
        });
    }
};

// ========== PUT CONTROLLER ==========

// PUT - Update profile by ID
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const updatedProfile = await ProfileModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: updatedProfile,
            message: "Profile updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error updating profile"
        });
    }
};

// ========== DELETE CONTROLLER ==========

// DELETE - Delete profile by ID
export const deleteProfile = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedProfile = await ProfileModel.findByIdAndDelete(id);
        
        if (!deletedProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            data: deletedProfile,
            message: "Profile deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "Error deleting profile"
        });
    }
};