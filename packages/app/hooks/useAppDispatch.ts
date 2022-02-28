import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux";

//This hook allows for the dispatch hook to use typescript types
const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
