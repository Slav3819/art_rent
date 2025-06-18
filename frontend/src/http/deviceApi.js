import { jwtDecode } from "jwt-decode";
import { $authHost, $host } from "./index";

export const device = async () => {
     const response = await $host.get('')
     return response
}