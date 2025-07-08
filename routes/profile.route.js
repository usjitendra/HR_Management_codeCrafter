import express from 'express';
import { addProfile, deleteProfile, getProfiles, updateProfile } from '../controllers/profile.controller.js';

const profileRouter = express.Router();

// ========== PROFILE ROUTES ==========

// GET Routes
profileRouter.get('/', getProfiles);           // GET /api/profiles - Get all profiles
profileRouter.get('/:id', getProfiles);       // GET /api/profiles/:id - Get single profile by ID

// POST Routes
profileRouter.post('/', addProfile);          // POST /api/profiles - Create new profile

// PUT Routes
profileRouter.put('/:id', updateProfile);     // PUT /api/profiles/:id - Update profile by ID

// DELETE Routes
profileRouter.delete('/:id', deleteProfile);  // DELETE /api/profiles/:id - Delete profile by ID

export default profileRouter;