import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SaveModalProps {
  visible: boolean;
}

const SaveModal: React.FC<SaveModalProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box animate-slide-up">
        <div className="modal-top-bar" />
        <CheckCircle size={64} className="modal-icon" />
        <h3 className="modal-title">Success</h3>
        <p className="modal-desc">บันทึกผลการประเมินโครงการสำเร็จเสร็จสิ้นเรียบร้อยแล้ว</p>
      </div>
    </div>
  );
};

export default SaveModal;
