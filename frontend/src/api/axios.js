import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});


export function setAccessToken(token) {
    localStorage.setItem("accessToken", token);
}

api.interceptors.request.use((cfg) => {
    let accessToken = localStorage.getItem("accesstoken");
    if(accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
    return cfg;
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null){
    refreshQueue.forEach(prom => {
        if(error) prom.reject(error);
        else prom.resolve(token);
    });
    refreshQueue = [];
}

api.interceptors.response.use((res) => res, async (err) => {
    const originalReq = err.config;

    if(err.response?.status === 401 && !originalReq._retry) {
        if(isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({ resolve, reject });
            }).then((token => {
                originalReq.headers.Authorization = `Bearer ${token}`;
                return api(originalReq);
            }));
        }

        originalReq._retry = true;
        isRefreshing = true;

        try{
            const r = await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/refresh`, {}, { withCredentials: true });

            const newAccessToken = r.data.accessToken;
            setAccessToken(newAccessToken);

            processQueue(null, newAccessToken);

            originalReq.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalReq);
        } catch (refreshErr) {
            processQueue(refreshErr, null);
            setAccessToken(null);
            throw refreshErr;
        } finally {
            isRefreshing = false;
        }

    }
});

export default api;
