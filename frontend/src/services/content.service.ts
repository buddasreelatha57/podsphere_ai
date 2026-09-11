import api from "./api";

// Upload Content
export const uploadContent = async (formData: FormData) => {
  const response = await api.post(
    "/content/upload",
    formData,
    {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) /
            (progressEvent.total || 1)
        );

        console.log("Upload:", progress + "%");
      },
    }
  );

  return response.data;
};

// Get My Uploaded Content
export const getMyContent = async () => {
  const response = await api.get("/content/my");

  return response.data;
};

// Get All Public Content (Home Feed - later)
export const getAllContent = async () => {
  const response = await api.get("/content");

  return response.data;
};

// Get Single Content (Watch Page - later)
export const getContentById = async (id: string) => {
  const response = await api.get(`/content/${id}`);

  return response.data;
};

// Get Favorites
export const getFavorites = async () => {
  const response = await api.get("/content/favorites");
  return response.data;
};

// Delete Content (later)
export const deleteContent = async (id: string) => {
  const response = await api.delete(`/content/${id}`);

  return response.data;
};

// Update Content (later)
export const updateContent = async (
  id: string,
  data: any
) => {
  const response = await api.put(`/content/${id}`, data);

  return response.data;
};

//likes dislikes


export const likeVideo = (id: string) =>
  api.post(`/content/${id}/like`);

export const dislikeVideo = (id: string) =>
  api.post(`/content/${id}/dislike`);

export const bookmarkVideo = (id: string) =>
  api.post(`/content/${id}/bookmark`);

export const shareVideo = (id: string) =>
  api.post(`/content/${id}/share`);

export const viewVideo = (id: string) =>
  api.post(`/content/${id}/view`);