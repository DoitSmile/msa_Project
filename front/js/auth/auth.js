class AuthService {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const response = await axios.post("/api/auth/refresh");
            const { accessToken } = response.data;
            this.setToken(accessToken);
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async getCurrentUserAsync() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.getCurrentUser();
        resolve(user);
      }, 100);
    });
  }

  decodeToken(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  getCurrentUser() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const decodedToken = this.decodeToken(token);
    console.log("Decoded token:", decodedToken); // 디버깅용
    return decodedToken
      ? { id: decodedToken.id, name: decodedToken.name }
      : null;
  }

  setToken(token) {
    localStorage.setItem("accessToken", token);
  }

  getToken() {
    return localStorage.getItem("accessToken");
  }

  async login(email, password) {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });
      if (response.data && response.data.accessToken) {
        this.setToken(response.data.accessToken);
        localStorage.setItem("isLoggedIn", "true");
      }
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    delete axios.defaults.headers.common["Authorization"];
  }

  isAuthenticated() {
    return localStorage.getItem("isLoggedIn") === "true" && !!this.getToken();
  }
}

const authService = new AuthService();
export { authService as AuthService };
