import { jwtDecode } from "jwt-decode";
import { $authHost, $host } from "./index";

export const registration = async (name, email, password) => {
    const {data} = await $host.post('api/registration', {name, email, password});
    return jwtDecode(data.token);
}

export const login = async (email, password) => {
    const {data} = await $host.post('api/login', {email, password}, {
        withCredentials: true
    }) ;
    return jwtDecode(data.token);
}

export const check = async () => {
    try {
        const {data} = await $authHost.get('api/user', {
            withCredentials: true
        });;
        return data
    } catch (error) {
        console.error('Auth check error:', error);
    } 
}

export const logout = async () => {
    try {
        await $authHost.get('api/logout', {
            withCredentials: true
        });
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};