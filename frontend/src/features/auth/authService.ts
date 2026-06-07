import api, { getApiData } from "~/api/api";
import { saveAuthSession } from "~/constants/auth";

interface LoginResponse {
    token?: string;
    accessToken?: string;
}

export async function loginWithEmail(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const data = getApiData<LoginResponse>(response);
    const token = data.token ?? data.accessToken;

    if (!token) {
        throw new Error("Login response does not contain an access token");
    }

    saveAuthSession(token, "admin");
    return token;
}
