import { LOCAL_SERVER_URL } from "./dev";

const SERVER_URL = __DEV__
  ? LOCAL_SERVER_URL
  : "https://inforest-julian.herokuapp.com/";

export default SERVER_URL;
