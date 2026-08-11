export default function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (error.response) {
    const { status, data } = error.response;

    if (data?.message) {
      return data.message;
    }

    switch (status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'The resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 500:
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  if (error.request) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  return fallback;
}
