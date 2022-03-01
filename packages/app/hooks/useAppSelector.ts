import { TypedUseSelectorHook, useSelector } from "react-redux";
import type { RootState } from "../redux";

//This hook allows for the selector hook to use typescript types
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
