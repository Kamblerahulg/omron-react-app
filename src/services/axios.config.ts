import axios from "axios";

axios.defaults.baseURL = "http://localhost:8080"; // <-- backend port
axios.defaults.headers.common["Content-Type"] = "application/json";
