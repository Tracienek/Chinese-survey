import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

export default function Login() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const loginGoogle = async () => {
    setErr("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      setUser(loggedUser);

      // check admin từ Firestore
      const qAdmin = query(
        collection(db, "admins"),
        where("email", "==", loggedUser.email)
      );
      const snapshot = await getDocs(qAdmin);

      if (!snapshot.empty) {
        navigate("/admin");
      } else {
        navigate("/survey");
      }
    } catch (e) {
      console.error(e);
      setErr("Không thể đăng nhập. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f5f2ed" }} // be sáng
    >
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card shadow border-0" style={{ backgroundColor: "#fffaf4" }}>
          <div className="card-body p-4">
            <h3
              className="text-center fw-bold mb-3"
              style={{ color: "#8d5524" }} // nâu đậm
            >
              Ty Gấm
            </h3>
            <p className="text-center text-muted mb-4">
              Đăng nhập bằng Gmail để bắt đầu khảo sát
            </p>

            {err && (
              <div className="alert alert-danger" role="alert">
                {err}
              </div>
            )}

            {!user ? (
              <button
                className="btn w-100 d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#8d5524",
                  color: "#fff",
                  height: 48,
                  borderRadius: 10,
                }}
                onClick={loginGoogle}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Đang đăng nhập…
                  </>
                ) : (
                  <>
                    {/* icon G kiểu đơn giản */}
                    <span
                      className="me-2 d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#fff",
                        color: "#8d5524",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      G
                    </span>
                    Đăng nhập với Gmail
                  </>
                )}
              </button>
            ) : (
              <div className="alert alert-success text-center">
                Hello học sinh <b>{user.displayName}</b> ({user.email}) nha!!!
              </div>
            )}

            <hr className="my-4" />
            <div className="d-flex justify-content-between small">
              <span className="text-muted">© {new Date().getFullYear()} Ty Gấm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
