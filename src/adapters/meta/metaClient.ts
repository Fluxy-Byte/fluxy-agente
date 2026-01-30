import axios from "axios";
import axiosRetry from "axios-retry";
import https from "https";

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
});

const metaClient = axios.create({
  timeout: 120000, // 2 min
  httpsAgent: agent,
});

axiosRetry(metaClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNRESET" ||
      error.code === "ECONNABORTED"
    );
  },
});

export default metaClient;
