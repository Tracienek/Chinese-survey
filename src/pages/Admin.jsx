import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit as fbLimit,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import ExpandableText from "./../components/ExpandableText";


const BE = { light: "#fffaf4", header: "#d8c3a5", text: "#5c3d2e" };

export default function Admin() {
  // ----- UI state -----
  const [selectedDate, setSelectedDate] = useState(() => {
    // mặc định hôm nay (YYYY-MM-DD)
    return new Date().toISOString().split("T")[0];
  });
  const [onlyToday, setOnlyToday] = useState(true);
  const [search, setSearch] = useState("");
  const [limitCount, setLimitCount] = useState(200);

  // ----- data state -----
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ----- fetch from Firestore -----
  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const base = collection(db, "responses");

      let q;
      if (onlyToday && selectedDate) {
        // lọc theo ngày đã chọn + orderBy thời gian tạo (mới nhất trước)
        q = query(
          base,
          where("date", "==", selectedDate),
          orderBy("createdAt", "desc"),
          fbLimit(limitCount)
        );
      } else {
        q = query(base, orderBy("createdAt", "desc"), fbLimit(limitCount));
      }

      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setResponses(rows);
    } catch (e) {
      // Nếu gặp lỗi index khi where + orderBy, Firestore sẽ gợi ý link tạo index.
      setErr(e.message || "Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyToday, selectedDate, limitCount]);

  // ----- client-side search -----
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return responses;
    return responses.filter((r) => {
      const pool = [
        r.email,
        r.googleName,
        r.studentName,
        r.className,   
        r.teacher,    
        r.answers?.teachingPace,
        r.answers?.attitudes?.join(", "),
        r.answers?.fixLevel,
        r.answers?.generalFeedback,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return pool.includes(kw);
    });
  }, [responses, search]);

  // ----- delete one document -----
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá bản ghi này?")) return;
    try {
      await deleteDoc(doc(db, "responses", id));
      setResponses((prev) => prev.filter((r) => r.id !== id));
      alert("Đã xoá thành công!");
    } catch (e) {
      console.error(e);
      alert("Xoá thất bại: " + (e.message || "unknown error"));
    }
  };

  // ----- export CSV -----
  const exportCSV = () => {
    const header = [
      "Date",
      "Email",
      "GoogleName",
      "StudentName",
      "ClassName",    // NEW
      "Teacher",      // NEW
      "TeachingPace",
      "TeachingPaceNote",
      "Attitudes",
      "AttitudeNote",
      "FixLevel",
      "FixNote",
      "GeneralFeedback",
    ];
    const rows = filtered.map((r) => [
      r.date || "",
      r.email || "",
      r.googleName || "",
      r.studentName || "",
      r.className || "",
      r.teacher || "",
      r.answers?.teachingPace || "",
      r.answers?.teachingPaceNote || "",
      (r.answers?.attitudes || []).join("; "),
      r.answers?.attitudeNote || "",
      r.answers?.fixLevel || "",
      r.answers?.fixNote || "",
      (r.answers?.generalFeedback || "").replace(/\n/g, " "),
    ]);

    const csv =
      header.join(",") +
      "\n" +
      rows
        .map((cols) =>
          cols
            .map((v) => {
              const val = String(v ?? "");
              // escape dấu phẩy & ngoặc kép cho đúng CSV
              if (/[",\n]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
              return val;
            })
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `responses_${onlyToday ? selectedDate : "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 1200 }}>
      {/* Card filter */}
      <div className="card border-0 shadow-sm mb-3" style={{ background: BE.light }}>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label" style={{ color: BE.text }}>Ngày</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={!onlyToday}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label" style={{ color: BE.text }}>Tìm kiếm</label>
              <input
                className="form-control"
                placeholder="email / tên / lớp / giáo viên…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label" style={{ color: BE.text }}>Giới hạn</label>
              <select
                className="form-select"
                value={limitCount}
                onChange={(e) => setLimitCount(Number(e.target.value))}
              >
                {[50, 100, 200, 500, 1000].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex gap-2">
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="onlyToday"
                  checked={onlyToday}
                  onChange={(e) => setOnlyToday(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="onlyToday" style={{ color: BE.text }}>
                  Chỉ hôm nay
                </label>
              </div>

              <button className="btn btn-secondary mt-3" onClick={fetchData}>
                Làm mới
              </button>
              <button className="btn btn-outline-secondary mt-3" onClick={exportCSV}>
                Xuất CSV
              </button>
            </div>
          </div>

          {err && (
            <div className="alert alert-danger mt-3">
              {err}
              <div className="small mt-1">
                Nếu thấy lỗi index khi <code>where("date")==</code> và <code>orderBy("createdAt")</code>, nhấn
                link gợi ý từ Firestore để tạo composite index rồi thử lại.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-hover">
          <thead style={{ background: BE.header, color: BE.text }}>
            <tr>
              <th>Ngày</th>
              {/* <th>Email</th> */}
              <th>Tên Google</th>
              <th>Tên học sinh</th>
              <th>Lớp</th>       
              <th>Giáo viên</th>  
              <th>Cách giảng</th>
              <th>Thái độ</th>
              <th>Sửa bài</th>
              <th>Góp ý</th>
              <th>Hành động</th>  
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={11} className="text-center py-4">Đang tải…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={11} className="text-center py-4">Không có dữ liệu</td></tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  {/* <td>{r.email}</td> */}
                  <td>{r.googleName}</td>
                  <td>{r.studentName || "-"}</td>
                  <td>{r.className || "-"}</td>  
                  <td>{r.teacher || "-"}</td>     
                  <td>
                    {r.answers?.teachingPace}
                    {r.answers?.teachingPaceNote ? ` – ${r.answers.teachingPaceNote}` : ""}
                  </td>
                  <td>
                    {(r.answers?.attitudes || []).join(", ")}
                    {r.answers?.attitudeNote ? ` – ${r.answers.attitudeNote}` : ""}
                  </td>
                  <td>
                    {r.answers?.fixLevel}
                    {r.answers?.fixNote ? ` – ${r.answers?.fixNote}` : ""}
                  </td>
                  <td>
                    <ExpandableText text={r.answers?.generalFeedback} />
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(r.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
