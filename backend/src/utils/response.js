// Credit Book — Utility: Standard Response Formatters

function successResponse(data, message = 'Success') {
  return { success: true, message, data };
}

function errorResponse(code, message, details = null) {
  return {
    success: false,
    error: { code, message, ...(details && { details }) },
  };
}

function paginatedResponse(data, total, page, limit) {
  return {
    success: true,
    data: {
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = { successResponse, errorResponse, paginatedResponse };
