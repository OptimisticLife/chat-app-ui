import { useNavigate } from "react-router-dom";

function useNav() {
  const navigate = useNavigate();

  return {
    navigate,
  };
}
export default useNav;
