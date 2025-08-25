import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function ProtectedRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null); // null = chưa biết
  const user = auth.currentUser;

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const q = query(collection(db, "admins"), where("email", "==", user.email));
      const snapshot = await getDocs(q);
      setIsAdmin(!snapshot.empty); // true nếu có email trong admins
    };
    checkAdmin();
  }, [user]);

  if (!user) return <Navigate to="/" />; // chưa login → quay về login
  if (isAdmin === null) return <div className="text-center mt-5">Đang kiểm tra quyền...</div>;
  if (!isAdmin) return <Navigate to="/survey" />; // không phải admin → survey

  return children; // admin → cho vào
}
