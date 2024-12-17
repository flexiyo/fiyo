import customAxios from "@/utils/customAxios.js";

export const getBulkUsersDetails = async (userIds) => {
  const fiyoauthApiBaseUri = import.meta.env.VITE_FIYOAUTH_API_BASE_URI;
  try {
    const { data: response } = await customAxios.post(
      `${fiyoauthApiBaseUri}/users/bulk`,
      {
        userIds,
      },
      {
        headers: {
          fiyoat: JSON.parse(localStorage.getItem("userInfo")).tokens.at,
        },
      },
    );
    const user = response.data;
    return user;
  } catch (error) {
    throw new Error(`Error in getBulkUsersDetails: ${error}`);
  }
};
