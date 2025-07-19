import React, { useEffect, useState } from "react";

import styles from "./ForgotPassword.module.css";
import { emailRegex, passwordRegex } from "../../Utils/RegEx";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

import { motion } from "framer-motion";
import { IsloggedIn } from "../../Utils/Auth";

function ForgotPassword() {
  const [step, setstep] = useState(0);

  const navigate = useNavigate()

    useEffect(()=>{
    IsloggedIn() ? navigate("/home") : ""
  },[]) 


  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.5,
      }}
      className={styles.container}
    >
      <div className={styles.formContainer}>
        <h2>Forgot Password...</h2>
        {step === 0 && <EmailComponent setstep={setstep} />}
        {step === 1 && <OTPComponent setstep={setstep} />}
        {step === 2 && <PasswordComponent />}
      </div>
    </motion.div>
  );
}

export default ForgotPassword;

const EmailComponent = ({ setstep }) => {
  const [isloading, setisloading] = useState(false);
  const [email, setemail] = useState("");

  const getOTP = async () => {
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setisloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_SERVER_URL}/user/resetPassword`,
        { email }
      );

      toast.success(response.data.message);
      localStorage.setItem("email", email);
      setstep(1);
      setisloading(false);
    } catch (error: any) {
      toast.error(error.response.data.message);
      setisloading(false);

      console.log(error);
    }
  };

  return (
    <div className={styles.inputContainer}>
      <input
        value={email}
        placeholder="Enter your email..."
        type="email"
        name="email"
        onChange={(e) => {
          setemail(e.target.value);
        }}
      />
      <button onClick={getOTP}>{isloading ? <Loader /> : "GET OTP"}</button>
      <Link to="/">Wanna Login?</Link>
    </div>
  );
};

const OTPComponent = ({ setstep }) => {
  const [isloading, setisloading] = useState(false);

  const [OTP, setTOTP] = useState("");

  const verifyOTP = async () => {
    try {
      setisloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_SERVER_URL}/user/verifyPasswordOTP`,
        { OTP }
      );

      toast.success(response.data.message);

      setisloading(false);
      setstep(2);
    } catch (error: any) {
      toast.error(error.response.data.message + " Please try again");
      setstep(0);
      setisloading(false);
      console.log(error);
    }
  };

  return (
    <div className={styles.inputContainer}>
      <input
        value={OTP}
        placeholder="Enter your OTP..."
        type="text"
        onChange={(e) => {
          setTOTP(e.target.value);
        }}
      />
      <button onClick={verifyOTP}>
        {isloading ? <Loader /> : "VERIFY OTP"}
      </button>
    </div>
  );
};

const PasswordComponent = () => {
  const [password, setpassword] = useState("");
  const [isloading, setisloading] = useState(false);

  const [show, setshow] = useState(false);

  const navigate = useNavigate();

  const resetPassword = async () => {
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters and must include at least one special character and one number"
      );
      return;
    }

    try {
      setisloading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_SERVER_URL}/user/resetPassword`,
        { password, isOTPVerified: true, email: localStorage.getItem("email") }
      );

      toast.success(response.data.message);
      setisloading(false);
      navigate("/");
      localStorage.removeItem("email");
    } catch (error: any) {
      toast.error(error.response.data.message);
      setisloading(false);

      console.log(error);
    }
  };

  return (
    <div className={styles.PasswordComponent}>
      <div className={styles.passwordContainer}>
        <input
          value={password}
          placeholder="Enter your new password..."
          type={show ? "text" : "password"}
          name="password"
          onChange={(e) => {
            setpassword(e.target.value);
          }}
        />
        <button
          onClick={() => {
            setshow(!show);
          }}
        >
          {show ? "HIDE" : "SHOW"}
        </button>
      </div>
      <div className={styles.inputContainer}>
        <button onClick={resetPassword}>
          {isloading ? <Loader /> : "RESET PASSWORD"}
        </button>
      </div>
    </div>
  );
};
