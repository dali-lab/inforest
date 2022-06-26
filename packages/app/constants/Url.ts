import { LOCAL_SERVER_URL } from "./dev";

const SERVER_URL = __DEV__
  ? LOCAL_SERVER_URL
  : "https://inforest-backend.onrender.com/";

export default SERVER_URL;
