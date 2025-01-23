import express from 'express';

import 
{ 
  register, 
  login, 
  logout,
  sendText,
  getLoginInfo
} from '../controllers/controller.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get("/loginInfo",getLoginInfo);
router.get('/text', sendText)
router.get('/logout', logout);

export default router;