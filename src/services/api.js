import axios from "axios";

const API = axios.create({
  baseURL: "https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api",
});

export default API;