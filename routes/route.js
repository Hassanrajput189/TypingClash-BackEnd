import express from 'express';
import 
{ 
  register, 
  login, 
  logout,
  sendText,
  getUser,
  getStats,
} from '../controllers/controller.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/stats', getStats);
router.get('/text', sendText)
router.get('/logout', logout);
router.get('/me',isAuthenticated ,getUser);

export default router;