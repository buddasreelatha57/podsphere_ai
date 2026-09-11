import api from "./api";

// History
export const getHistory = async () => {
  const response = await api.get("/user/history");
  return response.data;
};

// Profile
export const updateProfile = async (data: any) => {
  const response = await api.put("/user/profile", data);
  return response.data;
};

export const updateProfileImages = async (formData: FormData) => {
  const response = await api.put("/user/profile/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Settings
export const updateSettings = async (settings: any) => {
  const response = await api.put("/user/settings", { settings });
  return response.data;
};

// Follow
export const toggleFollowUser = async (userId: string) => {
  const response = await api.post(`/user/${userId}/follow`);
  return response.data;
};
