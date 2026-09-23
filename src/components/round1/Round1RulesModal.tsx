import React from 'react';
import { X, Award, Clock, Users, BookOpen } from 'lucide-react';

interface Round1RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Round1RulesModal: React.FC<Round1RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl p-6 md:p-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            THỂ LỆ CHÍNH THỨC
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            PHẦN THI: HIỂU BIẾT SỐ
          </h2>
          <p className="text-cyan-400 font-bold text-lg mt-1">“AI HIỂU BIẾT SỐ HƠN”</p>
        </div>

        <div className="space-y-6 text-slate-200">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Hình thức tham gia</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-300">
              <li>Mỗi đội thi chọn <strong>03 thí sinh</strong> tham gia phần thi này.</li>
              <li>Từng đội tham gia trả lời câu hỏi trắc nghiệm do Ban Tổ chức chuẩn bị theo các đáp án A, B, C, D.</li>
              <li>Mỗi đội tham gia trả lời <strong>04 câu hỏi / bộ câu hỏi (gói câu hỏi)</strong>.</li>
              <li>Thí sinh giơ bảng đáp án A/B/C/D trực tiếp tại sân khấu.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Thời gian & Điểm số</span>
            </h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-300">
              <li>Mỗi câu hỏi có thời gian vừa suy nghĩ vừa trả lời: <strong>10 giây</strong>.</li>
              <li>Hết 10 giây, đồng hồ khóa câu hỏi, người điều hành xem bảng giơ của thí sinh và bấm kết quả.</li>
              <li>Trả lời đúng: <strong>05 điểm</strong>.</li>
              <li>Không trả lời hoặc trả lời sai: <strong>00 điểm</strong>.</li>
              <li>Điểm tối đa: <strong>20 điểm / bộ câu hỏi</strong>.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h3 className="text-base font-bold text-indigo-300 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>Nội dung câu hỏi</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tập trung vào: Chuyển đổi số, Chính quyền số, Kinh tế số, Xã hội số, Dịch vụ công trực tuyến, Định danh điện tử (VNeID), Thanh toán không dùng tiền mặt, Mã QR, An toàn thông tin, Phòng chống lừa đảo mạng, Sử dụng mạng xã hội an toàn, Nhận diện tin giả, Kỹ năng sử dụng điện thoại thông minh và ứng dụng số thông dụng.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base transition shadow-lg shadow-cyan-950/50"
          >
            Đã Rõ Thể Lệ
          </button>
        </div>
      </div>
    </div>
  );
};
