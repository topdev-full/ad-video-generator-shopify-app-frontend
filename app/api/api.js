import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

export const BASE_URL = "https://544112c723a9.ngrok-free.app";
const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51PMV1x96qwFkAOsoeE7W8aqh6jt1xLiyc2X2eSZhPlGfIigxyfI2QxngI7W3H8QP9stvmeQgu8ABD543GpOaKtuP00sv1wWD3q";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const generateVideo = async (productId, images, template, shop) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/video`,
      {
        prompt: template.prompt,
        product_id: productId.toString(),
        images: images.map((row) => row.url),
        shop: shop,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const getCredits = async (shop) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/credits`,
      {
        shop: shop,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const getVideoList = async (shop) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/video?shop=${shop}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const updateVideo = async (id) => {
  try {
    const res = await axios.put(`${BASE_URL}/api/v1/video/${id}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    return res;
  } catch (error) {
    throw error;
  }
};

export const deleteVideo = async (id, shop, accessToken) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/api/v1/video/${id}?shop=${shop}&token=${accessToken}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
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
    const res = await axios.post(
      `${BASE_URL}/api/v1/upload`,
      {
        shop,
        token,
        video_id,
        video_url,
        product_id,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return res;
  } catch (error) {
    throw error;
  }
};

export const buyCredits = async (shop, plan, credits, redirectUrl) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/create-checkout-session`,
      {
        shop,
        plan,
        credits,
        redirectUrl,
      },
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    const id = res.data.id;
    const stripe = await stripePromise;
    await stripe?.redirectToCheckout({ sessionId: id });
  } catch (error) {
    throw error;
  }
};
