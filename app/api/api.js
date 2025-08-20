import axios from "axios";
const BASE_URL = "https://172.105.3.20";

export const generateVideo = async (productId, images, template, shop) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/v1/video`, {
      prompt: template.prompt,
      product_id: productId.toString(),
      images: images.map((row) => row.url),
      shop: shop,
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const getVideoList = async (shop) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/video?shop=${shop}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const getProducts = async (token) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res);
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateVideo = async (id) => {
  try {
    const res = await axios.put(`${BASE_URL}/api/v1/video/${id}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteVideo = async (id, shop, accessToken) => {
  try {
    const res = await axios.delete(`${BASE_URL}/api/v1/video/${id}?shop=${shop}&token=${accessToken}`);
    return res;
  } catch (error) {
    throw error;
  }
};

export const uploadVideo = async (
  shop,
  token,
  video_id,
  video_url,
  product_id,
) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/v1/upload`, {
      shop,
      token,
      video_id,
      video_url,
      product_id,
    });
    return res;
  } catch (error) {
    throw error;
  }
};
