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

export const ordersUser = async () => {
    try {
        const response = await $authHost.get('api/orders_list/', {
            withCredentials: true,
            headers: { 'Accept': 'application/json',
            'Content-Type': 'application/json',
            }
        });
        return response
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
     
}

export const favoriteUser = async () => {
    try {
        const response = await $authHost.get('api/favorites/', {
            withCredentials: true,
            headers: { 'Accept': 'application/json',
            'Content-Type': 'application/json',
            }
        });
        return response
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
     
}

export const favoriteDelete = async (id_device) => {
    try {
        const response = await $authHost.delete('api/favorites/', {
            data: { device_id: id_device }, // Передаём ID устройства в теле запроса
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting favorite:', error);
        throw error;
    }
};

export const infoUser = async (data) => {
    console.log(data)
    try {
        const response = await $host.patch('/user', data, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
};