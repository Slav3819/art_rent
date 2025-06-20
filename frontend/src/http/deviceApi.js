import { jwtDecode } from "jwt-decode";
import { $authHost, $host } from "./index";

export const devicePage = async (page = 1, category = null) => {
  const params = {
    page: page
  };
  
  if (category) {
    params.category = category;
  }
  const response = await $host.get('', { params });
  return response;
};

export const device = async () => {
     const response = await $host.get('')
     return response
}