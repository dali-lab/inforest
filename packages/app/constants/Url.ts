import { LOCAL_SERVER_URL } from "./dev";

const SERVER_URL = __DEV__ ? LOCAL_SERVER_URL : "http://100.97.244.92:3000/";

export default SERVER_URL;
