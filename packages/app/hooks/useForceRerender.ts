import { useState } from "react";

const useForceRerender = () => {
  const [value, setValue] = useState(0); // integer state
  return () => setValue((value) => value + 1); // update the state to force render
};

export default useForceRerender;
