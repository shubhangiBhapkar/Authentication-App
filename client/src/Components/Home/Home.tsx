import React, { ChangeEvent, useEffect, useState } from "react";

import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { emailRegex, passwordRegex } from "../../Utils/RegEx";
import Loader from "../Loader/Loader";

import { motion } from "framer-motion";

interface User {
  username: string;
  email: string;
}

function Home() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const [user, setuser] = useState<User | null>(null);

  const [newUserData, setnewUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isloading, setisloading] = useState(false);

  const [isEdit, setisEdit] = useState({
    username: false,
    email: false,
    password: false,
  });

  const getUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_SERVER_URL}/user/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      // console.log(response);

      setuser(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;

    setnewUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    console.log(newUserData);
  }

  const updateUserData = async (type: string) => {
    if (!emailRegex.test(newUserData.email) && type === "email") {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!passwordRegex.test(newUserData.password) && type === "password") {
      toast.error(
        "Password must be at least 8 characters and must include at least one special character and one number"
      );
      return;
    }

    if (!newUserData.username && type === "username") {
      toast.error("Please enter a valid username");
      return;
    }

    try {
      setisloading(true);
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_SERVER_URL}/user/updateUser`,
        { type, newUserData },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(response.data.message);

      setisEdit({ email: false, password: false, username: false });
      setnewUserData({ username: "", password: "", email: "" });

      getUser();
      setisloading(false);
    } catch (error: any) {
      toast.error(error.response.data.message);

      setisloading(false);
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      {user && (
        <nav>
          <span>Hello {user.username}</span>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/");
              toast.success("User loggged out");
            }}
            className={styles.logoutBtn}
          >
            LOGOUT
          </button>
        </nav>
      )}

      {user && (
        <div className={styles.mainContainer}>
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 1,
            }}
            className={styles.user}
          >
            <b>User Details</b>
            <p>Username : {user.username}</p>
            <p>Email : {user.email}</p>
          </motion.div>
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
            className={styles.editContainer}
          >
            <h3>
              <b>Update User</b>
            </h3>
            <div>
              <input
                name="username"
                value={newUserData.username}
                onChange={handleChange}
                disabled={!isEdit.username}
                placeholder="Update Username"
                type="text"
              />
              <button
                onClick={() => {
                  setisEdit((prev) => ({
                    ...prev,
                    username: true,
                  }));
                }}
                className={styles.edit}
              >
                EDIT
              </button>
              {isEdit.username && (
                <div className={styles.buttons}>
                  {isloading ? (
                    <Loader />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          updateUserData("username");
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setisEdit((prev) => ({
                            ...prev,
                            username: false,
                          }));
                          setnewUserData((prev) => ({
                            ...prev,
                            username: "",
                          }));
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div>
              <input
                name="email"
                value={newUserData.email}
                onChange={handleChange}
                disabled={!isEdit.email}
                placeholder="Update Email"
                type="text"
              />
              <button
                onClick={() => {
                  setisEdit((prev) => ({
                    ...prev,
                    email: true,
                  }));
                }}
                className={styles.edit}
              >
                EDIT
              </button>
              {isEdit.email && (
                <div className={styles.buttons}>
                  {isloading ? (
                    <Loader />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          updateUserData("email");
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setisEdit((prev) => ({
                            ...prev,
                            email: false,
                          }));
                          setnewUserData((prev) => ({
                            ...prev,
                            email: "",
                          }));
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className={styles.passwordEdit}>
              <div className={styles.passwordContainer}>
                <input
                  name="password"
                  value={newUserData.password}
                  onChange={handleChange}
                  disabled={!isEdit.password}
                  placeholder="Update Password"
                  type={show ? "text" : "password"}
                />
                <button
                  onClick={() => {
                    setShow(!show);
                  }}
                >
                  {show ? "HIDE" : "SHOW"}
                </button>
              </div>
              <button
                onClick={() => {
                  setisEdit((prev) => ({
                    ...prev,
                    password: true,
                  }));
                  setnewUserData((prev) => ({
                    ...prev,
                    email: "",
                  }));
                }}
                className={styles.edit}
              >
                EDIT
              </button>
            </div>
            {isEdit.password && (
              <div className={styles.buttons}>
                {isloading ? (
                  <Loader />
                ) : (
                  <>
                    <button
                      onClick={() => {
                        updateUserData("password");
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setisEdit((prev) => ({
                          ...prev,
                          password: false,
                        }));
                        setnewUserData((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Home;
