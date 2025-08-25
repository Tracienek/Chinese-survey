import { useEffect, useState, useMemo } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

// Detect in-app browsers (Messenger/IG/Zalo/TikTok/Twitter webview...)
function isInAppBrowser() {
  const ua = (navigator.userAgent || "").toLowerCase();
  return /(fban|fbav|fb_iab|instagram|line|zalo|tiktok|twitter|wv)/i.test(ua);
}

export default function Login() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // handle after login: check admin or not
  const afterLogin = async (loggedUser) => {
    if (!loggedUser) return;
    setUser(loggedUser);

    // check admin từ Firestore
    const qAdmin = query(collection(db, "admins"), where("email", "==", loggedUser.email));
    const snapshot = await getDocs(qAdmin);
    if (!snapshot.empty) {
      navigate("/admin");
    } else {
      navigate("/survey");
    }
  };

  // Fallback cho signInWithRedirect (Safari/Popup bị chặn)
  useEffect(() => {
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) await afterLogin(res.user);
      } catch (e) {
        // không làm gì, chỉ để tránh uncaught
        console.error("redirect result error:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginGoogle = async () => {
    setErr("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();

      // Thử popup trước (đa số browser OK)
      try {
        const result = await signInWithPopup(auth, provider);
        await afterLogin(result.user);
        return;
      } catch (e) {
        // Safari thường chặn popup: fallback sang redirect
        if (e?.code === "auth/popup-blocked" || e?.code === "auth/cancelled-popup-request") {
          await signInWithRedirect(auth, provider);
          return; // điều hướng xong sẽ quay lại và được handle ở getRedirectResult
        }
        throw e;
      }
    } catch (e) {
      console.error(e);
      setErr("Không thể đăng nhập. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // -------- In-app browser gate (Google chặn đăng nhập ở đây) ----------
  const inApp = useMemo(() => isInAppBrowser(), []);
  if (inApp) {
    const here = typeof window !== "undefined" ? window.location.href : "/";
    const androidChromeIntent =
      `intent://${window.location.host}${window.location.pathname}${window.location.search}` +
      `#Intent;scheme=https;package=com.android.chrome;end`;

    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#f5f2ed" }}>
        <div className="container" style={{ maxWidth: 520 }}>
          <div className="card shadow border-0" style={{ backgroundColor: "#fffaf4" }}>
            <div className="card-body p-4">
              <h3 className="text-center fw-bold mb-3" style={{ color: "#8d5524" }}>Ty Gấm</h3>
              <div className="alert alert-warning">
                Bạn đang mở trong <b>ứng dụng</b> (Messenger/Zalo/Instagram…). Google
                <b> chặn đăng nhập</b> ở đây. Vui lòng mở bằng trình duyệt:
                <div className="mt-3 d-flex gap-2 flex-wrap">
                  <a className="btn btn-sm btn-primary" href={here} target="_blank" rel="noopener noreferrer">
                    Mở trong trình duyệt
                  </a>
                  <a className="btn btn-sm btn-dark" href={androidChromeIntent}>
                    Mở bằng Chrome (Android)
                  </a>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => navigator.clipboard.writeText(here)}
                  >
                    Copy link
                  </button>
                </div>
                <div className="small mt-2">
                  iOS: bấm <b>⋯</b> → <b>Open in Safari</b> · Android: bấm <b>⋮</b> → <b>Open in Chrome</b>
                </div>
              </div>
              <div className="text-center text-muted small">© {new Date().getFullYear()} Ty Gấm</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // --------------------------------------------------------------------

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: "#f5f2ed" }} // be sáng
    >
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card shadow border-0" style={{ backgroundColor: "#fffaf4" }}>
          <div className="card-body p-4">
            <h3 className="text-center fw-bold mb-3" style={{ color: "#8d5524" }}>
              Ty Gấm
            </h3>
            <p className="text-center text-muted mb-4">
              Đăng nhập bằng Google để bắt đầu khảo sát
            </p>

            {err && <div className="alert alert-danger">{err}</div>}

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
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Đang đăng nhập…
                  </>
                ) : (
                  <>
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
                    Đăng nhập với Google
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
