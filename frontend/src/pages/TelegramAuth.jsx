import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../services/api";
import { selectUser } from "../features/userSlice";
import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const TelegramAuth = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      toast.error(t("telegram.errors.missingLink"));
      navigate("/");
      return;
    }

    if (!user._id) {
      toast.error(t("telegram.errors.notLoggedIn"));
      navigate("/login");
      return;
    }

    api.post("/telegram/connect", { token, userId: user._id })
      .then(() => {
        toast.success(t("telegram.success.connected"));
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        if (err.response?.status === 401) {
          toast.error(t("telegram.errors.invalidToken"));
        } else if (err.response?.status === 404) {
          toast.error(t("telegram.errors.userNotFound"));
        } else {
          toast.error(t("telegram.errors.generic"));
        }
        navigate("/");
      });
  }, [user, navigate, t]);

  return null;
};

export default TelegramAuth;
