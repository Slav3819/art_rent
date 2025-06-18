import { ADMIN_ROUTE, BASKET_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, DEVICE_ROUTE, SHOP_ROUTE, CABINET_ROUTE, ABOUT_ROUTE, CONTACT_ROUTE } from './utils/consts';
import Admin from './pages/Admin';
import Basket from './pages/Basket';
import Shop from './pages/Shop';
import DevicePage from './pages/DevicePage';
import Auth from './pages/Auth';
import Cabinet from './pages/Cabinet';
import About from './pages/About';
import Contact from './pages/Contact';




// Доспупно только авторизованым
export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        component: Admin
    },
    {
        path: BASKET_ROUTE,
        component: Basket
    },
    {
        path: CABINET_ROUTE,
        component: Cabinet
    }
    
]

// Доступно всем
export const publicRoutes = [
    {
        path: SHOP_ROUTE,
        component: Shop
    },
    {
        path: LOGIN_ROUTE,
        component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        component: Auth
    },
    {
        path: `${DEVICE_ROUTE}/:id`,
        component: DevicePage
    },
    {
        path: CABINET_ROUTE,
        component: Cabinet
    },
    {
        path: ABOUT_ROUTE,
        component: About
    },
    {
        path: CONTACT_ROUTE,
        component: Contact
    }
]