import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Survey() {
  const user = auth.currentUser;

  // Tên học sinh (tùy chọn)
  const [studentName, setStudentName] = useState("");

  // NEW: Giáo viên & Lớp
  const teacherOptions = ["Cô Gấm", "Cô Vy", "Cô Hà"];
  const [teacher, setTeacher] = useState("");
  const [className, setClassName] = useState("");
  const [classOther, setClassOther] = useState("");

  // 1) Cách giảng (radio) + ghi chú
  const paceOptions = ["Rất nhanh", "Nhanh", "Vừa phải", "Chậm"];
  const [teachingPace, setTeachingPace] = useState("");
  const [teachingPaceNote, setTeachingPaceNote] = useState("");

  // 2) Thái độ trong lớp (checkbox nhiều lựa chọn) + ghi chú
  const attitudeOptions = [
    "Tệ",
    "Hơi tệ",
    "Ổn",
    "Bình thường",
    "Good",
    "Em thích cô này",
    "Vui vẻ",
  ];
  const [attitudes, setAttitudes] = useState([]); // mảng string
  const [attitudeNote, setAttitudeNote] = useState("");

  // 3) Sửa bài (radio) + ghi chú
  const fixOptions = ["Kỹ", "Bình thường", "Ổn", "Rất kỹ"];
  const [fixLevel, setFixLevel] = useState("");
  const [fixNote, setFixNote] = useState("");

  // 4) Góp ý (tự do)
  const [generalFeedback, setGeneralFeedback] = useState("");

  const toggleAttitude = (val) => {
    setAttitudes((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleSubmit = async () => {
    if (!user) return alert("Bạn chưa đăng nhập!");

    // lớp thực tế (nếu chọn Khác thì lấy classOther)
    const finalClass = className === "Khác" ? classOther.trim() : className;

    // Tối thiểu chọn 1 vài mục để tránh submit rỗng
    if (
        !teacher ||
        !className.trim() ||
        (!teachingPace && attitudes.length === 0 && !fixLevel && !generalFeedback.trim())
    ) {
    return alert("Vui lòng chọn giáo viên, điền lớp và trả lời ít nhất một mục trước khi gửi.");
    }


    const today = new Date().toISOString().split("T")[0];

    await addDoc(collection(db, "responses"), {
      email: user.email,
      googleName: user.displayName,
      studentName: studentName || null,

      // NEW: lưu giáo viên & lớp
      teacher,            // "Cô Gấm" | "Cô Vy" | "Cô Hà"
      className: finalClass, // ví dụ "10A3" hoặc giá trị tự nhập

      answers: {
        teachingPace,
        teachingPaceNote,

        attitudes,
        attitudeNote,

        fixLevel,
        fixNote,

        generalFeedback,
      },

      date: today,
      createdAt: serverTimestamp(),
    });

    alert("Đã gửi khảo sát! Cảm ơn bạn ❤️");

    // reset form
    setStudentName("");
    setTeacher("");
    setClassName("");
    setClassOther("");
    setTeachingPace("");
    setTeachingPaceNote("");
    setAttitudes([]);
    setAttitudeNote("");
    setFixLevel("");
    setFixNote("");
    setGeneralFeedback("");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 820 }}>
      <div className="card shadow-lg border-0" style={{ backgroundColor: "#fffaf4" }}>
        <div className="card-body">
          <h3 className="card-title text-center mb-4" style={{ color: "#8d5524" }}>
            📋 Khảo sát hôm nay
          </h3>
          <p className="text-center" style={{ color: "#555" }}>
            Nhớ học bài mỗi ngày nhé
          </p>

          {/* Tên học sinh (tùy chọn) */}
          <div className="mb-3">
            <label className="form-label">Tên học sinh (có thể bỏ trống)</label>
            <input
              className="form-control"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nhập tên hoặc để trống"
            />
          </div>

          {/* NEW: Giáo viên được đánh giá */}
          <div className="mb-4 p-3 rounded" style={{ background: "#f5f2ed" }}>
            <h5 className="mb-2" style={{ color: "#5c3d2e" }}>Giáo viên được đánh giá</h5>
            {teacherOptions.map((t) => (
              <div className="form-check" key={t}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={`teacher-${t}`}
                  name="teacher"
                  value={t}
                  checked={teacher === t}
                  onChange={(e) => setTeacher(e.target.value)}
                />
                <label className="form-check-label" htmlFor={`teacher-${t}`}>{t}</label>
              </div>
            ))}
          </div>

          {/* NEW: Lớp nào */}
          <div className="mb-4 p-3 rounded" style={{ background: "#f5f2ed" }}>
            <h5 className="mb-2" style={{ color: "#5c3d2e" }}>Lớp</h5>
            <input
                className="form-control"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
            />
        </div>


          {/* 1) Cách giảng */}
          <div className="mb-4 p-3 rounded" style={{ background: "#f5f2ed" }}>
            <h5 className="mb-2" style={{ color: "#5c3d2e" }}>1. Cách giảng</h5>
            {paceOptions.map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={`pace-${opt}`}
                  name="teachingPace"
                  value={opt}
                  checked={teachingPace === opt}
                  onChange={(e) => setTeachingPace(e.target.value)}
                />
                <label className="form-check-label" htmlFor={`pace-${opt}`}>{opt}</label>
              </div>
            ))}
            <input
              className="form-control mt-2"
              placeholder="Cảm nghĩ thêm (tùy chọn)…"
              value={teachingPaceNote}
              onChange={(e) => setTeachingPaceNote(e.target.value)}
            />
          </div>

          {/* 2) Thái độ trong lớp */}
          <div className="mb-4 p-3 rounded" style={{ background: "#f5f2ed" }}>
            <h5 className="mb-2" style={{ color: "#5c3d2e" }}>2. Thái độ trong lớp</h5>
            <div className="row">
              {attitudeOptions.map((opt) => (
                <div className="col-6 col-md-4" key={opt}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`att-${opt}`}
                      checked={attitudes.includes(opt)}
                      onChange={() => toggleAttitude(opt)}
                    />
                    <label className="form-check-label" htmlFor={`att-${opt}`}>{opt}</label>
                  </div>
                </div>
              ))}
            </div>
            <input
              className="form-control mt-2"
              placeholder="Cảm nghĩ thêm (tùy chọn)…"
              value={attitudeNote}
              onChange={(e) => setAttitudeNote(e.target.value)}
            />
          </div>

          {/* 3) Sửa bài */}
          <div className="mb-4 p-3 rounded" style={{ background: "#f5f2ed" }}>
            <h5 className="mb-2" style={{ color: "#5c3d2e" }}>3. Sửa bài</h5>
            {fixOptions.map((opt) => (
              <div className="form-check" key={opt}>
                <input
                  className="form-check-input"
                  type="radio"
                  id={`fix-${opt}`}
                  name="fixLevel"
                  value={opt}
                  checked={fixLevel === opt}
                  onChange={(e) => setFixLevel(e.target.value)}
                />
                <label className="form-check-label" htmlFor={`fix-${opt}`}>{opt}</label>
              </div>
            ))}
            <input
              className="form-control mt-2"
              placeholder="Cảm nghĩ thêm (tùy chọn)…"
              value={fixNote}
              onChange={(e) => setFixNote(e.target.value)}
            />
          </div>

          {/* 4) Góp ý chung */}
          <div className="mb-4 p-3 rounded" style={{ background: "#f5f2ed" }}>
            <h5 className="mb-2" style={{ color: "#5c3d2e" }}>4. Góp ý</h5>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Viết góp ý của bạn…"
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button
                className="btn btn-outline-secondary px-5 py-2 rounded-3 fw-bold btn-lg rounded-pill"
                style={{ backgroundColor: "#d8c3a5", color: "#5c3d2e", borderColor: "#8d5524" }}
                onClick={handleSubmit}
            >
                <i className="bi bi-check-circle me-2"></i>
                Gửi khảo sát
            </button>
            </div>
        </div>
      </div>
    </div>
  );
}
