import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux";

const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
