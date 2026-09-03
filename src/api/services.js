import api from './axios';

function pageResult(res) {
  const data = res.data?.data;
  if (Array.isArray(data)) {
    return { items: data, page: 0, totalPages: 1, totalElements: data.length, size: data.length };
  }
  return {
    items: data?.content || [],
    page: data?.page || 0,
    size: data?.size || 10,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
  };
}

function uploadFile(endpoint, file) {
  if (!file) return Promise.resolve(null);
  const formData = new FormData();
  formData.append('file', file);
  return api
    .post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => {
      const body = res.data?.data;
      return typeof body === 'string' ? body : body?.filePath || null;
    });
}

export const businessApi = {
  search: (params) => api.get('/businesses/search', { params }).then(pageResult),
  list: (params) => api.get('/businesses', { params }).then(pageResult),
  get: (id) => api.get(`/businesses/${id}`).then((res) => res.data.data),
  getMy: (params) => api.get('/businesses/my', { params }).then(pageResult),
  adminList: (params) => api.get('/businesses/all', { params }).then(pageResult),
  create: (payload) => api.post('/businesses', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/businesses/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/businesses/${id}`),
  updateStatus: (id, status, reason) =>
    api.patch(`/businesses/${id}/status`, { status, reason }).then((res) => res.data.data),
  approve: (id) => api.put(`/businesses/${id}/approve`).then((res) => res.data.data),
  gallery: (id) => api.get(`/businesses/${id}/gallery`).then((res) => res.data?.data || []),
  uploadLogo: (id, file) => uploadFile(`/businesses/${id}/logo`, file),
  uploadCover: (id, file) => uploadFile(`/businesses/${id}/cover`, file),
  deleteLogo: (id) => api.delete(`/businesses/${id}/logo`),
  deleteCover: (id) => api.delete(`/businesses/${id}/cover`),
  uploadGallery: (id, file) => uploadFile(`/businesses/${id}/gallery`, file),
  deleteGallery: (id, imageId) => api.delete(`/businesses/${id}/gallery/${imageId}`),
};

export const categoryApi = {
  list: (params) => api.get('/categories', { params }).then(pageResult),
  get: (id) => api.get(`/categories/${id}`).then((res) => res.data.data),
  create: (payload) => api.post('/categories', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/categories/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/categories/${id}`),
};

export const reviewApi = {
  list: (businessId, params) => api.get(`/reviews/${businessId}`, { params }).then(pageResult),
  my: (params) => api.get('/reviews/user', { params }).then(pageResult),
  create: (payload) => api.post('/reviews', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/reviews/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/reviews/${id}`),
  adminList: (params) => api.get('/admin/reviews', { params }).then(pageResult),
};

export const favoriteApi = {
  list: (params) => api.get('/favorites', { params }).then(pageResult),
  toggle: (businessId) => api.post(`/favorites/${businessId}`).then((res) => res.data),
  check: (businessId) =>
    api.get(`/favorites/${businessId}/check`).then((res) => Boolean(res.data?.data)),
};

export const organizationApi = {
  list: (params) => api.get('/organizations', { params }).then(pageResult),
  get: (id) => api.get(`/organizations/${id}`).then((res) => res.data.data),
  getMy: (params) => api.get('/organizations/my', { params }).then(pageResult),
  create: (payload) => api.post('/organizations', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/organizations/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/organizations/${id}`),
  uploadLogo: (id, file) => uploadFile(`/organizations/${id}/logo`, file),
  deleteLogo: (id) => api.delete(`/organizations/${id}/logo`),
};

export const trainingApi = {
  list: (params) => api.get('/trainings', { params }).then(pageResult),
  get: (id) => api.get(`/trainings/${id}`).then((res) => res.data.data),
  getByOrganization: (orgId, params) => api.get(`/trainings/organization/${orgId}`, { params }).then(pageResult),
  getMy: (params) => api.get('/trainings/my', { params }).then(pageResult),
  create: (payload) => api.post('/trainings', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/trainings/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/trainings/${id}`),
  publish: (id) => api.post(`/trainings/${id}/publish`).then((res) => res.data.data),
  unpublish: (id) => api.post(`/trainings/${id}/unpublish`).then((res) => res.data.data),
  updateStatus: (id, status) =>
    api.patch(`/trainings/${id}/status`, status, { headers: { 'Content-Type': 'text/plain' } }).then((res) => res.data.data),
  uploadImage: (id, file) => uploadFile(`/trainings/${id}/image`, file),
  deleteImage: (id) => api.delete(`/trainings/${id}/image`),

  // Registration & Participation
  register: (trainingId) => api.post(`/trainings/${trainingId}/register`).then((res) => res.data.data),
  cancelRegistration: (trainingId) => api.delete(`/trainings/${trainingId}/register`),
  getMyRegistrations: (params) => api.get('/trainings/my/registrations', { params }).then(pageResult),
  getMyRegistrationForTraining: (trainingId) =>
    api.get(`/trainings/${trainingId}/my-registration`).then((res) => res.data?.data || null).catch(() => null),

  // Organization participant management
  getParticipants: (trainingId, params) => api.get(`/trainings/${trainingId}/participants`, { params }).then(pageResult),
  updateRegistrationStatus: (trainingId, registrationId, status) =>
    api.patch(`/trainings/${trainingId}/registrations/${registrationId}/status`, status, { headers: { 'Content-Type': 'text/plain' } }).then((res) => res.data.data),
};

export const challengeApi = {
  list: (params) => api.get('/challenges', { params }).then(pageResult),
  get: (id) => api.get(`/challenges/${id}`).then((res) => res.data.data),
  getByOrganization: (orgId, params) => api.get(`/challenges/organization/${orgId}`, { params }).then(pageResult),
  getMy: (params) => api.get('/challenges/my', { params }).then(pageResult),
  create: (payload) => api.post('/challenges', payload).then((res) => res.data.data),
  update: (id, payload) => api.put(`/challenges/${id}`, payload).then((res) => res.data.data),
  remove: (id) => api.delete(`/challenges/${id}`),
  publish: (id) => api.post(`/challenges/${id}/publish`).then((res) => res.data.data),
  close: (id) => api.post(`/challenges/${id}/close`).then((res) => res.data.data),
  updateStatus: (id, status) =>
    api.patch(`/challenges/${id}/status`, status, { headers: { 'Content-Type': 'text/plain' } }).then((res) => res.data.data),
  uploadImage: (id, file) => uploadFile(`/challenges/${id}/image`, file),
  deleteImage: (id) => api.delete(`/challenges/${id}/image`),

  // Application workflow
  apply: (challengeId, motivation) =>
    api.post(`/challenges/${challengeId}/apply`, { motivation }).then((res) => res.data.data),
  cancelApplication: (challengeId) => api.delete(`/challenges/${challengeId}/apply`),
  getMyApplications: (params) => api.get('/challenges/my/applications', { params }).then(pageResult),
  getMyApplicationForChallenge: (challengeId) =>
    api.get(`/challenges/${challengeId}/my-application`).then((res) => res.data?.data || null).catch(() => null),

  // Organization applicant management
  getApplications: (challengeId, params) => api.get(`/challenges/${challengeId}/applications`, { params }).then(pageResult),
  updateApplicationStatus: (challengeId, applicationId, status) =>
    api.patch(`/challenges/${challengeId}/applications/${applicationId}/status`, status, { headers: { 'Content-Type': 'text/plain' } }).then((res) => res.data.data),
};

export function averageRating(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const sum = items.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return sum / items.length;
}

export const adminApi = {
  // User management
  getUsers: (params) => api.get('/admin/users', { params }).then(pageResult),
  getUser: (id) => api.get(`/admin/users/${id}`).then((res) => res.data.data),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((res) => res.data.data),
  updateUserStatus: (id, status) =>
    api.patch(`/admin/users/${id}/status`, { status }).then((res) => res.data.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Organization management
  getOrganizations: (params) => api.get('/organizations', { params }).then(pageResult),
  deleteOrganization: (id) => api.delete(`/organizations/${id}`),

  // Training management
  getTrainings: (params) => api.get('/admin/trainings', { params }).then(pageResult),
  getTraining: (id) => api.get(`/trainings/${id}`).then((res) => res.data.data),
  deleteTraining: (id) => api.delete(`/trainings/${id}`),

  // Challenge management
  getChallenges: (params) => api.get('/admin/challenges', { params }).then(pageResult),
  getChallenge: (id) => api.get(`/challenges/${id}`).then((res) => res.data.data),
  deleteChallenge: (id) => api.delete(`/challenges/${id}`),

  // Dashboard
  getDashboard: () => api.get('/dashboard/admin').then((res) => res.data.data),
};

export const authApi = {
  verifyEmail: (email, otp) =>
    api.post('/auth/verify-email', { email, otp }).then((res) => res.data),
  resendVerification: (email) =>
    api.post('/auth/resend-verification', { email }).then((res) => res.data),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }).then(pageResult),
  unreadCount: () => api.get('/notifications/unread-count').then((res) => res.data.data ?? 0),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data.data),
  markAllRead: () => api.patch('/notifications/read-all').then((res) => res.data.data),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const notificationPreferenceApi = {
  get: () => api.get('/notification-preferences').then((res) => res.data?.data || []),
  update: (preferences) =>
    api.put('/notification-preferences', { preferences }).then((res) => res.data?.data || []),
};