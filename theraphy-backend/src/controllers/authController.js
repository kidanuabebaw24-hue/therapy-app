import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responseHelper.js';

export const register = async (req, res) => {
  try {
    const { user, token } = await AuthService.register(req.body);
    return sendSuccess(res, { user, token }, 'User registered successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 400, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);
    return sendSuccess(res, { user, token }, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, 401, error);
  }
};

export const getMe = async (req, res) => {
  try {
    return sendSuccess(res, { user: req.user }, 'User profile retrieved');
  } catch (error) {
    return sendError(res, error.message, 500, error);
  }
};
