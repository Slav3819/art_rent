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


export const orderSuccess = async (customerInfo, orderItems, total) => {
  try {
    const response = await $host.post('/api/orders/', {
      customerInfo,
      orderItems,
      total
    }, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Order error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};
