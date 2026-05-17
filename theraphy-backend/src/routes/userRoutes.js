import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  getUserStats, 
  getTherapists, 
  getClients,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.get('/therapists', protect, getTherapists);
router.get('/clients', protect, authorize('therapist', 'admin'), getClients);

// Emergency Contacts Management
router.post('/profile/emergency-contacts', protect, addEmergencyContact);
router.put('/profile/emergency-contacts/:contactId', protect, updateEmergencyContact);
router.delete('/profile/emergency-contacts/:contactId', protect, deleteEmergencyContact);

export default router;
