import axios from "axios";
import Cookies from 'js-cookie';


const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
})

const $authHost = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
})

const authInterceptor = config => {
    return config;
}



$authHost.interceptors.request.use(authInterceptor);

export {
    $host,
    $authHost
}