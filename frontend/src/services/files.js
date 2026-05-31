import api from './api';

export const fetchFiles = async () => {
  const response = await api.get('/files');
  return response.data;
};

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

export const downloadFileLink = async (fileId, expiresInSeconds = 300) => {
  const response = await api.get(`/files/${fileId}/download?expiresIn=${expiresInSeconds}`);
  return response.data; // returns { downloadUrl, expiresIn }
};

export const shareFileWithUser = async (fileId, sharedWithEmail, permissionType) => {
  const response = await api.post('/share', { fileId, sharedWithEmail, permissionType });
  return response.data;
};

export const fetchSharedFiles = async () => {
  const response = await api.get('/shared');
  return response.data;
};
