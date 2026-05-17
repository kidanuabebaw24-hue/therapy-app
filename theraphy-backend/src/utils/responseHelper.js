export const sendSuccess = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'Error', status = 500, error = null) => {
  if (error) {
    console.error('API Error:', {
      status,
      message,
      error: error.message || error,
      stack: error.stack
    });
  }
  return res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};
