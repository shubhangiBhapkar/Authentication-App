import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";

const Auth = () => {
  return IsloggedIn() ? <Outlet /> : <Navigate to="/" />;
};

export default Auth;

export const IsloggedIn = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return false;
  }

  const { exp } = jwtDecode(token);

  console.log(exp * 1000, Date.now());

  if (exp! * 1000 > Date.now()) {
    return true;
  } else {
    localStorage.clear();
    return false;
  }
};
