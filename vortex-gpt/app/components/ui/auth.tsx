"use client";

import { useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function Auth({
  user,
  setUser,
}: {
  user: any;
  setUser: (user: any) => void;
}) {
  const { t } = useTranslation();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        toast.success(t("signInSuccess"));
      })
      .catch((error) => {
        console.error("Sign-in error:", error);
        toast.error(t("signInFailed"));
      });
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        toast.success(t("signOutSuccess"));
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
        toast.error(t("signOutFailed"));
      });
  };

  return (
    <div className="fixed top-4 right-20">
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">{user.displayName}</span>
          <button onClick={handleSignOut} className="btn btn-secondary text-sm">
            {t("signOut")}
          </button>
        </div>
      ) : (
        <button onClick={handleSignIn} className="btn btn-primary text-sm">
          {t("signIn")}
        </button>
      )}
    </div>
  );
}