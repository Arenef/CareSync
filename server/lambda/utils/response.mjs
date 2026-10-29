const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS"
};

export const successResponse = (statusCode = 200, data = null, message = "Thành công") => {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify({
      success: true,
      message,
      data
    })
  };
};

export const errorResponse = (statusCode = 500, message = "Lỗi hệ thống", error = null) => {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify({
      success: false,
      message,
      error: error ? (error.message || error) : undefined
    })
  };
};
