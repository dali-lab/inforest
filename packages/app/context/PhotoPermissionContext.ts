import { createContext } from "react";
import { PermissionStatus } from "expo-modules-core";

interface PhotoPermissionContextType {
  status: PermissionStatus;
  setStatus: (newStatus: PermissionStatus) => void;
}

export const defaultPhotoPermissionContext: PhotoPermissionContextType = {
  status: PermissionStatus.UNDETERMINED,
  setStatus: () => {},
};

const PhotoPermissionContext = createContext<PhotoPermissionContextType>(
  defaultPhotoPermissionContext
);

export default PhotoPermissionContext;
