import React, { useState, ChangeEvent, useEffect } from "react";

import styles from "./Signup.module.css";
import { Link ,useNavigate} from "react-router-dom";
import { emailRegex, passwordRegex } from "../../Utils/RegEx";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "../Loader/Loader";

import { motion } from "framer-motion";
import { IsloggedIn } from "../../Utils/Auth";
function Signup() {
  const [userDetails, setuserDetails] = useState({
    username: "",
    password: "",
    email: "",
  });

  const [isloading, setisloading] = useState(false);

  const [show, setshow] = useState(false);


    const navigate = useNavigate();


      useEffect(()=>{
    IsloggedIn() ? navigate("/home") : ""
  },[]) 


  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    // console.log(name, value);

    setuserDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSignUp = async () => {
    if (!userDetails.username) {
      toast.error("Please enter a valid username");
      return;
    }
    if (!emailRegex.test(userDetails.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!passwordRegex.test(userDetails.password)) {
      toast.error(
        "Password must be at least 8 characters and must include at least one special character and one number"
      );
      return;
    }

    try {
      setisloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_SERVER_URL}/user/register`,
        userDetails
      );
      toast.success(response.data.message);
      console.log(response);
      setisloading(false);
navigate("/home");

    } catch (error: any) {
      toast.error(error.response.data.message);

      console.log(error);
      setisloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
      }}
      className={styles.container}
    >
      <div className={styles.formContainer}>
        <h2>Sign Up...</h2>
        <div className={styles.inputContainer}>
          <input
            value={userDetails.username}
            placeholder="Enter your username..."
            type="text"
            name="username"
            onChange={handleInputChange}
          />
          <input
            value={userDetails.email}
            placeholder="Enter your email..."
            type="email"
            name="email"
            onChange={handleInputChange}
          />

          <div className={styles.passwordContainer}>
            <input
              value={userDetails.password}
              placeholder="Enter your password..."
              type={show ? "text" : "password"}
              name="password"
              onChange={handleInputChange}
            />
            <button
              onClick={() => {
                setshow(!show);
              }}
            >
              {show ? "HIDE" : "SHOW"}
            </button>
          </div>
          <button onClick={handleSignUp}>
            {isloading ? <Loader /> : "Sign Up"}
          </button>
        </div>
        <Link to="/">Already have an account? Login</Link>
      </div>
    </motion.div>
  );
}

export default Signup;
