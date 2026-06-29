import React, { useState, useMemo, useEffect } from 'react';
import { ClipboardList, BarChart3, Trophy, Medal, Star, Save, Play, CheckCircle, AlertCircle, Info, ChevronRight } from 'lucide-react';

const AAPICO_COMPANIES = ['AA', 'AF', 'APC', 'ASP', 'AH', 'AHP', 'AHA', 'AHT', 'AL', 'AS', 'AP', 'AHR', 'APR'];
const INITIAL_PROJECTS = AAPICO_COMPANIES.flatMap((company) => [
  { 
    id: `${company}-1`, 
    name: `AI-Powered Process Optimization`, 
    team: company,
    objective: "ลดขั้นตอนและระยะเวลาการทำงานในกระบวนการผลิตด้วยโมเดลวิเคราะห์ข้อมูลเชิงทำนาย",
    techStack: "Python, TensorFlow, Scikit-learn, AWS GreenGrass",
    targetUsers: "ฝ่ายผลิตและฝ่ายควบคุมคุณภาพของ " + company
  },
  { 
    id: `${company}-2`, 
    name: `Computer Vision Quality Inspection`, 
    team: company,
    objective: "ตรวจจับรอยตำหนิชิ้นส่วนอะไหล่แบบเรียลไทม์ด้วยกล้อง AI แทนสายตามนุษย์เพื่อความแม่นยำ 99.9%",
    techStack: "OpenCV, PyTorch, YOLOv8, Industrial Edge Device",
    targetUsers: "วิศวกรฝ่ายผลิตและทีมตรวจสอบความคุ้มค่า " + company
  },
]);

const CRITERIA = [
  {
    id: 'c1', name: 'ผลกระทบต่อธุรกิจ', description: 'การปรับปรุงธุรกิจในด้านเวลา ต้นทุน คุณภาพ หรือการลดความเสี่ยง', maxScore: 30,
    rubrics: [
      { min: 25, max: 30, label: 'เปลี่ยนแปลงอย่างก้าวกระโดด', desc: 'ผลลัพธ์วัดผลได้และสร้างผลกระทบสูง เปลี่ยนวิธีการทำงานอย่างมีนัยสำคัญ ส่งผลระดับกลุ่มบริษัทหรือข้ามสายงาน' },
      { min: 18, max: 24, label: 'สูง', desc: 'ผลกระทบสูงและชัดเจน พร้อมตัวชี้วัดและเหตุผลทางธุรกิจ ส่งผลต่อปริมาณงานหรือต้นทุนในระดับสำคัญ' },
      { min: 11, max: 17, label: 'มีนัยสำคัญ', desc: 'เกิดการปรับปรุงที่มีความหมาย เห็นผลกระทบได้ชัดเจน แต่ขอบเขตยังจำกัดหรือวัดผลเพียงบางส่วน' },
      { min: 5, max: 10, label: 'ปานกลาง', desc: 'ระบุผลกระทบได้บางส่วน แต่ประโยชน์ยังมีขนาดเล็ก ไม่ชัดเจน หรือวัดผลได้ยาก' },
      { min: 0, max: 4, label: 'น้อยมาก', desc: 'ผลกระทบของแนวคิดยังไม่ชัดเจน มีผลลัพธ์จำกัด หรือยังไม่สามารถแสดงประโยชน์ได้อย่างชัดเจน' }
    ]
  },
  {
    id: 'c2', name: 'ความเป็นไปได้ในการดำเนินการ', description: 'ความสมจริงของแผนการดำเนินงาน ปฏิบัติได้จริงด้วยทรัพยากร/เครื่องมือ/ทักษะที่มี', maxScore: 25,
    rubrics: [
      { min: 22, max: 25, label: 'พร้อมนำไปใช้งาน', desc: 'เป็นไปได้สูงมาก ระบุเครื่องมือ ทักษะ และงบประมาณชัดเจน เริ่มดำเนินการได้ภายใน 1–2 เดือน' },
      { min: 17, max: 21, label: 'ทำได้จริง', desc: 'มีความสมจริงและใช้ความพยายามในระดับจัดการได้ ช่องว่างทรัพยากรหรือทักษะถูกระบุและแก้ไขได้' },
      { min: 11, max: 16, label: 'เป็นไปได้', desc: 'โดยหลักการทำได้ แต่ต้องเตรียมการ งบประมาณ หรือการสนับสนุนจากภายนอกในระดับมาก' },
      { min: 5, max: 10, label: 'ท้าทาย', desc: 'แนวทางยังไม่ชัดเจน หรือจำเป็นต้องใช้ทรัพยากรจำนวนมากที่ยังไม่มีในปัจจุบัน' },
      { min: 0, max: 4, label: 'ไม่สามารถดำเนินการได้', desc: 'ไม่มีแนวทางชัดเจน ไอเดียเป็นเพียงการคาดการณ์ ขาดข้อมูลสนับสนุนที่เป็นรูปธรรม' }
    ]
  },
  {
    id: 'c3', name: 'นวัตกรรมและความคิดสร้างสรรค์', description: 'ความแปลกใหม่สร้างสรรค์ในบริบท AAPICO ประยุกต์ใช้ AI อย่างสร้างสรรค์', maxScore: 20,
    rubrics: [
      { min: 18, max: 20, label: 'โดดเด่นระดับก้าวกระโดด', desc: 'แปลกใหม่สูง ประยุกต์ใช้ AI ในรูปแบบที่ไม่พบทั่วไป อาจพัฒนาเป็นความได้เปรียบในการแข่งขันได้' },
      { min: 14, max: 17, label: 'มีความเป็นต้นฉบับ', desc: 'เป็นแนวทางใหม่ในการแก้ปัญหา แสดงถึงความคิดสร้างสรรค์และความเข้าใจ AI ที่มากกว่าการใช้งานพื้นฐาน' },
      { min: 9, max: 13, label: 'มีความคิดริเริ่ม', desc: 'ประยุกต์ใช้ AI ได้ดี มีองค์ประกอบเชิงสร้างสรรค์บางส่วน ต่อยอดจากที่มีอยู่และปรับใช้ได้เหมาะสม' },
      { min: 4, max: 8, label: 'พัฒนาต่อยอด', desc: 'สมเหตุสมผล แต่คล้ายกรณีการใช้งาน AI มาตรฐาน ปรับให้เข้ากับบริบทเฉพาะจำกัด' },
      { min: 0, max: 3, label: 'ทั่วไป', desc: 'มีนวัตกรรมน้อย เป็นการนำเครื่องมือ AI ทั่วไปมาใช้โดยตรง ไม่มีการปรับให้เหมาะสมอย่างมีนัยสำคัญ' }
    ]
  },
  {
    id: 'c4', name: 'ความชัดเจนของการนำเสนอ', description: 'การสื่อสารปัญหา แนวทางแก้ไข และผลลัพธ์ที่คาดหวังได้ดีภายในเวลา 10 นาที', maxScore: 15,
    rubrics: [
      { min: 13, max: 15, label: 'ยอดเยี่ยม', desc: 'ชัดเจนโดดเด่น ทำให้เข้าใจปัญหา แนวทาง และผลกระทบได้ทันที การนำเสนอมั่นใจน่าสนใจ' },
      { min: 10, max: 12, label: 'ชัดเจน', desc: 'โครงสร้างดีติดตามง่าย อาจมีช่องว่างเล็กน้อย แต่สาระสำคัญโดยรวมมีความชัดเจน' },
      { min: 6, max: 9, label: 'พอใช้', desc: 'สื่อสารประเด็นหลักได้ แต่บางส่วนทำให้สับสนหรือขาดองค์ประกอบสำคัญ' },
      { min: 2, max: 5, label: 'บางส่วน', desc: 'องค์ประกอบสำคัญไม่ชัดเจนหรือขาดหาย เข้าใจแนวคิดหลักหรือคุณค่าได้ยาก' },
      { min: 0, max: 1, label: 'ไม่ชัดเจน', desc: 'การนำเสนอไม่มีการจัดลำดับที่ดี ไม่สามารถระบุปัญหาหรือแนวทางได้อย่างชัดเจน' }
    ]
  },
  {
    id: 'c5', name: 'ความสามารถในการขยายผล', description: 'ศักยภาพในการทำซ้ำหรือขยายผล beyond ทีม/แผนก เพื่อกลุ่ม AAPICO', maxScore: 10,
    rubrics: [
      { min: 9, max: 10, label: 'ระดับกลุ่มบริษัท', desc: 'นำไปใช้ได้กับทุกบริษัทในกลุ่ม AAPICO (13 บริษัท บริษัทละ 2 project) ปรับแก้เล็กน้อย เป็นโซลูชันต้นแบบ' },
      { min: 6, max: 8, label: 'ขยายผลระดับสูง', desc: 'สามารถนำไปทำซ้ำหรือปรับประยุกต์ใช้กับหลายบริษัทในกลุ่มบริษัทได้อย่างมีประสิทธิภาพ' },
      { min: 3, max: 5, label: 'ขยายผลระดับกลาง', desc: 'สามารถขยายผลไปยังแผนกอื่น หรือบริษัทบางแห่งในเครือได้ แต่ต้องมีการปรับแต่งเพิ่มเติม' },
      { min: 0, max: 2, label: 'ขยายผลจำกัด', desc: 'โซลูชันเฉพาะเจาะจงกับปัญหาของทีมใดทีมหนึ่งสูง ยากต่อการนำไปประยุกต์ใช้ซ้ำที่อื่น' }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('score'); 
  const [projects] = useState(INITIAL_PROJECTS);
  const [evaluations, setEvaluations] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState(INITIAL_PROJECTS[0].id);

  const [currentScores, setCurrentScores] = useState({});
  const [currentComment, setCurrentComment] = useState('');
  
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [revealState, setRevealState] = useState('idle'); 
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@300;400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);

  useEffect(() => {
    if (selectedProjectId && evaluations[selectedProjectId]) {
      setCurrentScores(evaluations[selectedProjectId].scores || {});
      setCurrentComment(evaluations[selectedProjectId].comment || '');
    } else {
      const initialScores = {};
      CRITERIA.forEach(c => initialScores[c.id] = 0);
      setCurrentScores(initialScores);
      setCurrentComment('');
    }
  }, [selectedProjectId, evaluations]);

  const calculateCurrentTotal = () => {
    let total = 0;
    CRITERIA.forEach(c => { 
      total += (parseFloat(currentScores[c.id]) || 0); 
    });
    return total.toFixed(2);
  };

  const handleScoreChange = (criteriaId, value) => {
    setCurrentScores(prev => ({
      ...prev,
      [criteriaId]: value 
    }));
  };

  const handleSaveEvaluation = () => {
    setEvaluations(prev => ({
      ...prev,
      [selectedProjectId]: {
        scores: currentScores,
        comment: currentComment,
        totalScore: parseFloat(calculateCurrentTotal())
      }
    }));
    
    setShowSaveModal(true);
    setTimeout(() => setShowSaveModal(false), 2000);
  };

  const startReveal = () => {
    setRevealState('counting');
    setCountdown(3);
    let currentCount = 3;
    const timer = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        clearInterval(timer);
        setRevealState('revealed');
      }
    }, 1000);
  };

  const leaderboard = useMemo(() => {
    const results = projects.map(project => {
      const evalData = evaluations[project.id];
      return {
        ...project,
        isEvaluated: !!evalData,
        totalScore: evalData ? evalData.totalScore : 0,
        scores: evalData ? evalData.scores : null,
        comment: evalData ? evalData.comment : '-'
      };
    });
    return results.sort((a, b) => b.totalScore - a.totalScore);
  }, [projects, evaluations]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const renderScoringForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[32px] items-start">
      
      {/* LEFT SIDE: Project Selection & Meta Details (41.6% width on large screens) */}
      <div className="lg:col-span-5 bg-[#FFFFFF] border-2 border-[#D8D9DA] p-[24px] rounded-none sticky top-[100px] shadow-sm">
        <div className="border-l-[8px] border-[#1D366D] pl-[16px] mb-[24px]">
          <h2 className="text-[24px] font-bold text-[#1D366D] uppercase tracking-wide">Project Details</h2>
          <p className="text-[14px] text-[#464C59] mt-[4px]">เลือกผลงานของกลุ่มบริษัท AAPICO เพื่อทำการประเมิน</p>
        </div>

        {/* Project Selector dropdown */}
        <div className="mb-[24px]">
          <label className="block text-[14px] font-bold text-[#1D366D] uppercase tracking-wider mb-[8px]">Select Company & Project</label>
          <select 
            className="w-full p-[16px] bg-[#FFFFFF] border-2 border-[#1D366D] rounded-none text-[#1D366D] font-bold text-[16px] focus:border-[#2DC84D] outline-none transition-colors"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.team} - {p.name} {evaluations[p.id] ? '✓' : ''}</option>
            ))}
          </select>
        </div>

        {/* Project Context Meta */}
        {selectedProject && (
          <div className="space-y-[16px] border-t border-b border-[#D8D9DA] py-[24px] my-[24px]">
            <div>
              <span className="text-[12px] bg-[#464C59] text-[#FFFFFF] px-[8px] py-[4px] font-bold tracking-wider uppercase">Company</span>
              <p className="text-[24px] font-bold text-[#1D366D] mt-[6px]">{selectedProject.team}</p>
            </div>
            <div>
              <span className="text-[12px] bg-[#464C59] text-[#FFFFFF] px-[8px] py-[4px] font-bold tracking-wider uppercase">Project Name</span>
              <p className="text-[18px] font-bold text-[#000000] mt-[6px]">{selectedProject.name}</p>
            </div>
            <div>
              <span className="text-[12px] bg-[#464C59] text-[#FFFFFF] px-[8px] py-[4px] font-bold tracking-wider uppercase">Objective</span>
              <p className="text-[14px] text-[#464C59] mt-[6px] leading-relaxed">{selectedProject.objective}</p>
            </div>
            <div>
              <span className="text-[12px] bg-[#464C59] text-[#FFFFFF] px-[8px] py-[4px] font-bold tracking-wider uppercase">AI Tech Stack</span>
              <p className="text-[14px] text-[#1D366D] font-mono mt-[6px]">{selectedProject.techStack}</p>
            </div>
            <div>
              <span className="text-[12px] bg-[#464C59] text-[#FFFFFF] px-[8px] py-[4px] font-bold tracking-wider uppercase">Target Users</span>
              <p className="text-[14px] text-[#464C59] mt-[6px]">{selectedProject.targetUsers}</p>
            </div>
            <div>
              <span className="text-[12px] bg-[#464C59] text-[#FFFFFF] px-[8px] py-[4px] font-bold tracking-wider uppercase">Status</span>
              <div className="mt-[8px] flex items-center gap-[8px]">
                {evaluations[selectedProjectId] ? (
                  <span className="text-[14px] font-bold text-[#2DC84D] flex items-center gap-[4px]">
                    <CheckCircle size={16} /> ประเมินแล้ว ({evaluations[selectedProjectId].totalScore.toFixed(2)} คะแนน)
                  </span>
                ) : (
                  <span className="text-[14px] font-bold text-[#A1A1A5] flex items-center gap-[4px]">
                    <AlertCircle size={16} /> รอกรรมการประเมินผลคะแนน
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Block */}
        <div className="mb-[24px]">
          <label className="block text-[14px] font-bold text-[#1D366D] mb-[8px] uppercase tracking-wider">Additional Feedback / ข้อสังเกต</label>
          <textarea 
            className="w-full p-[16px] bg-[#FFFFFF] border-2 border-[#D8D9DA] rounded-none focus:border-[#1D366D] focus:ring-0 outline-none text-[14px] text-[#000000]"
            rows="3"
            placeholder="โปรดระบุความคิดเห็นหรือข้อแนะนำที่เป็นประโยชน์เพิ่มเติมเพื่อนำไปสู่การปรับปรุงผลงาน..."
            value={currentComment}
            onChange={(e) => setCurrentComment(e.target.value)}
          ></textarea>
        </div>

        {/* Action Button & Total Score */}
        <div className="p-[16px] bg-[#F8F9FA] border border-[#D8D9DA]">
          <div className="flex justify-between items-center mb-[16px]">
            <div>
              <p className="text-[12px] text-[#464C59] uppercase font-bold tracking-wider">TOTAL EVALUATION SCORE</p>
              <div className="text-[36px] font-bold text-[#1D366D] leading-none">
                {calculateCurrentTotal()} <span className="text-[18px] text-[#A1A1A5]">/ 100</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleSaveEvaluation}
            className="w-full flex items-center justify-center gap-[12px] bg-[#1D366D] hover:bg-[#000000] text-[#FFFFFF] py-[16px] rounded-none text-[14px] font-bold uppercase tracking-wider transition-all border-b-4 border-[#2DC84D]"
          >
            <Save size={18} /> Save Evaluation Data
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Scoring Metrics & Rubric Checklist (58.3% width) */}
      <div className="lg:col-span-7 space-y-[24px]">
        
        <div className="bg-[#1D366D] text-[#FFFFFF] p-[24px] rounded-none border-b-4 border-[#2DC84D]">
          <h3 className="text-[24px] font-bold uppercase">Scoring Criteria & Evaluation Rubric</h3>
          <p className="text-[14px] text-[#A1A1A5] mt-[4px]">โปรดอ่านเกณฑ์การให้คะแนนแต่ละด้านให้ครบถ้วนก่อนพิจารณาปรับคะแนน</p>
        </div>

        {CRITERIA.map((criteria) => {
          const rawValue = currentScores[criteria.id] !== undefined ? currentScores[criteria.id] : 0;
          const currentScore = parseFloat(rawValue) || 0;

          return (
            <div key={criteria.id} className="p-[24px] bg-[#FFFFFF] border-2 border-[#D8D9DA] rounded-none relative">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-[#1D366D]"></div>
              
              {/* Header of Criterion */}
              <div className="flex justify-between items-start gap-[16px] mb-[12px]">
                <div>
                  <h4 className="text-[20px] font-bold text-[#1D366D] flex items-center gap-[8px]">
                    {criteria.name}
                  </h4>
                  <p className="text-[14px] text-[#464C59] mt-[2px]">{criteria.description}</p>
                </div>
                <div className="bg-[#1D366D] text-[#FFFFFF] px-[12px] py-[6px] text-[12px] font-bold uppercase tracking-widest shrink-0">
                  MAX PT: {criteria.maxScore}
                </div>
              </div>

              {}
              <div className="my-[16px] space-y-[8px]">
                <span className="text-[12px] font-bold text-[#1D366D] uppercase tracking-wider block mb-[6px] flex items-center gap-[4px]">
                  <Info size={14} /> Rubric Guide Checklist (เกณฑ์พิจารณารายคะแนน)
                </span>
                
                <div className="grid grid-cols-1 gap-[6px]">
                  {criteria.rubrics.map((r, rIdx) => {
                    const isSelected = currentScore >= r.min && currentScore <= r.max;
                    return (
                      <div 
                        key={rIdx} 
                        className={`p-[12px] transition-all border transition-colors ${
                          isSelected 
                            ? 'bg-[#2DC84D]/10 border-[#2DC84D] text-[#000000]' 
                            : 'bg-[#F8F9FA] border-[#D8D9DA] text-[#464C59]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-[4px]">
                          <span className={`text-[12px] font-bold uppercase ${isSelected ? 'text-[#1D366D]' : 'text-[#464C59]'}`}>
                            {r.label}
                          </span>
                          <span className={`text-[11px] font-mono px-[6px] py-[2px] ${isSelected ? 'bg-[#2DC84D] text-[#000000] font-bold' : 'bg-[#D8D9DA] text-[#464C59]'}`}>
                            {r.min} - {r.max} PTS
                          </span>
                        </div>
                        <p className="text-[12px] leading-relaxed">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Control Area: Slider on left, Number input on right (Single Row) */}
              <div className="flex items-center gap-[16px] bg-[#F8F9FA] p-[12px] border border-[#D8D9DA]">
                {/* Full-width Slider */}
                <div className="flex-1 flex items-center gap-[12px]">
                  <span className="text-[#464C59] text-[12px] font-bold">0</span>
                  <input 
                    type="range" 
                    min="0" 
                    max={criteria.maxScore} 
                    step="0.1"
                    className="w-full h-[6px] bg-[#D8D9DA] rounded-none appearance-none cursor-pointer accent-[#1D366D]"
                    value={currentScore}
                    onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                  />
                  <span className="text-[#464C59] text-[12px] font-bold">{criteria.maxScore}</span>
                </div>
                
                {/* Direct text numeric inputs */}
                <div className="shrink-0 flex items-center gap-[8px]">
                  <input 
                    type="number"
                    min="0"
                    max={criteria.maxScore}
                    step="0.1"
                    value={rawValue}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (parseFloat(val) > criteria.maxScore) {
                        val = criteria.maxScore.toString();
                      }
                      handleScoreChange(criteria.id, val);
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        handleScoreChange(criteria.id, "0.0");
                      } else {
                        handleScoreChange(criteria.id, parseFloat(e.target.value).toFixed(1));
                      }
                    }}
                    className="w-[100px] text-center bg-[#1D366D] text-[#FFFFFF] py-[8px] px-[6px] rounded-none border-b-2 border-[#2DC84D] text-[20px] font-bold focus:outline-none focus:ring-1 focus:ring-[#2DC84D] placeholder-[#A1A1A5]"
                    placeholder="0.0"
                  />
                  <span className="text-[12px] font-bold text-[#464C59]">PTS</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (revealState === 'idle') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-[32px] animate-fade-in">
          <div className="bg-[#1D366D] p-[32px] rounded-none border-l-[16px] border-[#2DC84D] shadow-lg">
            <BarChart3 size={72} className="text-[#FFFFFF]" />
          </div>
          <div className="text-center">
            <h2 className="text-[48px] font-bold text-[#1D366D] uppercase tracking-tight leading-tight">
              Evaluation Results
            </h2>
            <p className="text-[#464C59] text-[24px] mt-[8px]">
              Evaluated <span className="font-bold text-[#1D366D]">{Object.keys(evaluations).length}</span> of {projects.length} Projects
            </p>
          </div>
          <button 
            onClick={startReveal} 
            disabled={Object.keys(evaluations).length === 0}
            className={`px-[48px] py-[24px] rounded-none text-[24px] font-bold uppercase tracking-widest flex items-center gap-[16px] transition-all border-2 border-transparent ${
              Object.keys(evaluations).length === 0 
                ? 'bg-[#D8D9DA] text-[#A1A1A5] cursor-not-allowed' 
                : 'bg-[#2DC84D] text-[#000000] hover:bg-[#000000] hover:text-[#2DC84D] hover:border-[#2DC84D] shadow-xl transform hover:-translate-y-1'
            }`}
          >
            <Play fill="currentColor" size={32} /> แสดงผลคะแนน (Reveal)
          </button>
          {Object.keys(evaluations).length === 0 && (
            <p className="text-[#1D366D] text-[16px] mt-[8px] font-bold">Please evaluate at least one project.</p>
          )}
        </div>
      );
    }

    if (revealState === 'counting') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-[120px] md:text-[200px] font-bold text-[#1D366D] animate-pulse">
            {countdown}
          </div>
        </div>
      );
    }

    const evaluatedProjects = leaderboard.filter(p => p.isEvaluated);
    const top3 = evaluatedProjects.slice(0, 3);
    const consolation = evaluatedProjects.slice(3, 10); // 7 consolation prizes

    return (
      <div className="max-w-6xl mx-auto space-y-[48px] pb-[48px] relative z-10 animate-fade-in">
        <div className="text-center border-b-4 border-[#1D366D] pb-[24px]">
          <h1 className="text-[48px] font-bold text-[#1D366D] uppercase tracking-wide">
            Innovation Excellence Awards
          </h1>
          <p className="text-[#464C59] text-[24px]">Official Results & Rankings</p>
          <p className="text-[#2DC84D] font-bold text-[18px] mt-[8px]">ขอแสดงความยินดีกับผลงานที่ได้รับรางวัลทุกทีม!</p>
        </div>
        
        {/* Top 3 Cards - Glowing Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] items-end mt-[48px]">
          {top3.map((project, index) => {
            const ranks = [
              { 
                label: 'Winner (รางวัลชนะเลิศ)', 
                bg: 'bg-[#1D366D]', 
                text: 'text-[#FFFFFF]', 
                border: 'border-[#FFD700]', 
                glow: 'shadow-[0_0_50px_rgba(255,215,0,0.8)] border-t-[10px]', 
                height: 'md:h-[380px]', 
                scale: 'md:scale-110 md:-translate-y-6', 
                iconColor: 'text-[#FFD700]' 
              },
              { 
                label: 'Runner Up (รองชนะเลิศอันดับ 1)', 
                bg: 'bg-[#464C59]', 
                text: 'text-[#FFFFFF]', 
                border: 'border-[#C0C0C0]', 
                glow: 'shadow-[0_0_40px_rgba(192,192,192,0.6)] border-t-[8px]', 
                height: 'md:h-[320px]', 
                scale: '', 
                iconColor: 'text-[#C0C0C0]' 
              },
              { 
                label: '2nd Runner Up (รองชนะเลิศอันดับ 2)', 
                bg: 'bg-[#A1A1A5]', 
                text: 'text-[#000000]', 
                border: 'border-[#CD7F32]', 
                glow: 'shadow-[0_0_40px_rgba(205,127,50,0.6)] border-t-[8px]', 
                height: 'md:h-[320px]', 
                scale: '', 
                iconColor: 'text-[#CD7F32]' 
              }
            ];
            
            const currentRank = ranks[index];
            const delay = [0.3, 0.6, 0.9][index];

            return (
              <div 
                key={project.id} 
                className={`flex flex-col items-center text-center p-[32px] rounded-none relative animate-slide-up transition-all duration-700 ${currentRank.bg} ${currentRank.text} ${currentRank.border} ${currentRank.glow} ${currentRank.height} ${currentRank.scale} ${index === 0 ? 'md:order-2 z-20' : index === 1 ? 'md:order-1 z-10' : 'md:order-3 z-10'}`}
                style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
              >
                <div className="mb-[24px]">
                  <Trophy size={64} className={`${currentRank.iconColor} drop-shadow-lg`} />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-widest mb-[8px] bg-[#000000]/20 px-[12px] py-[4px]">
                  {currentRank.label}
                </span>
                <h3 className="font-bold text-[32px] leading-tight mt-[8px]">{project.team}</h3>
                <p className="text-[16px] opacity-90 mt-[8px] px-[8px] font-semibold">{project.name}</p>
                <div className="mt-auto pt-[24px] w-full border-t border-current/20">
                  <span className="text-[48px] font-bold leading-none">{project.totalScore.toFixed(2)}</span>
                  <span className="text-[12px] uppercase ml-[8px] font-bold tracking-widest opacity-80">PTS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Consolation Prizes (7 Awards) */}
        {consolation.length > 0 && (
          <div className="mt-[64px] animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
            <div className="flex items-center gap-[16px] mb-[24px] border-l-[8px] border-[#464C59] pl-[16px]">
              <h3 className="text-[32px] font-bold text-[#1D366D] uppercase">Honorable Mentions (รางวัลชมเชย 7 อันดับ)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              {consolation.map((project, index) => (
                <div key={project.id} className="bg-[#FFFFFF] p-[24px] rounded-none border-2 border-[#D8D9DA] flex items-center justify-between hover:border-[#1D366D] transition-colors">
                  <div className="flex items-center gap-[16px]">
                    <div className="w-[48px] h-[48px] bg-[#464C59] text-[#FFFFFF] rounded-none flex items-center justify-center font-bold text-[24px]">
                      {index + 4}
                    </div>
                    <div>
                      <div className="font-bold text-[#1D366D] text-[16px]">{project.team}</div>
                      <div className="text-[13px] text-[#464C59] font-medium leading-snug mt-[2px]">{project.name}</div>
                    </div>
                  </div>
                  <div className="text-right ml-[16px]">
                    <div className="font-bold text-[24px] text-[#1D366D]">{project.totalScore.toFixed(2)}</div>
                    <span className="text-[10px] text-[#A1A1A5] font-bold tracking-wider">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Standings Table */}
        <div className="mt-[64px] animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
          <div className="bg-[#FFFFFF] rounded-none border-2 border-[#1D366D] overflow-hidden">
             <div className="p-[24px] bg-[#1D366D] text-[#FFFFFF] flex justify-between items-center">
              <h2 className="text-[24px] font-bold flex items-center gap-[12px] uppercase tracking-wide">
                <BarChart3 /> Complete Standings (ตารางสรุปผลทั้งหมด)
              </h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[#F8F9FA] text-[#464C59] text-[12px] uppercase tracking-widest border-b-2 border-[#D8D9DA]">
                     <th className="p-[16px] font-bold text-center w-[100px]">Rank</th>
                     <th className="p-[16px] font-bold">Team / Project</th>
                     <th className="p-[16px] font-bold text-center w-[150px]">Total Score</th>
                     <th className="p-[16px] font-bold">Feedback</th>
                   </tr>
                 </thead>
                 <tbody className="text-[16px]">
                   {leaderboard.map((project, index) => {
                     let rowClass = "border-b border-[#D8D9DA] border-l-[4px] border-l-transparent hover:bg-[#F8F9FA] transition-colors";
                     let rankContent = project.isEvaluated ? index + 1 : '-';

                     if (project.isEvaluated) {
                       if (index === 0) {
                         rowClass = "border-b border-[#D8D9DA] bg-[#FFD700]/10 border-l-[6px] border-l-[#FFD700] hover:bg-[#FFD700]/20 transition-colors font-semibold";
                         rankContent = <div className="flex items-center justify-center gap-[8px]"><Trophy size={20} color="#FFD700" className="drop-shadow-sm" /> <span className="text-[#000000] font-extrabold">1</span></div>;
                       } else if (index === 1) {
                         rowClass = "border-b border-[#D8D9DA] bg-[#C0C0C0]/10 border-l-[6px] border-l-[#C0C0C0] hover:bg-[#C0C0C0]/20 transition-colors font-semibold";
                         rankContent = <div className="flex items-center justify-center gap-[8px]"><Trophy size={20} color="#C0C0C0" className="drop-shadow-sm" /> <span className="text-[#000000] font-extrabold">2</span></div>;
                       } else if (index === 2) {
                         rowClass = "border-b border-[#D8D9DA] bg-[#CD7F32]/10 border-l-[6px] border-l-[#CD7F32] hover:bg-[#CD7F32]/20 transition-colors font-semibold";
                         rankContent = <div className="flex items-center justify-center gap-[8px]"><Trophy size={20} color="#CD7F32" className="drop-shadow-sm" /> <span className="text-[#000000] font-extrabold">3</span></div>;
                       }
                     }

                     return (
                       <tr key={project.id} className={rowClass}>
                         <td className="p-[16px] text-center font-bold text-[#1D366D]">
                           {rankContent}
                         </td>
                         <td className="p-[16px]">
                           <div className="font-bold text-[#000000]">{project.team}</div>
                           <div className="text-[#464C59] text-[14px] mt-[4px]">{project.name}</div>
                         </td>
                         <td className="p-[16px] text-center">
                           {project.isEvaluated ? (
                             <span className="inline-block bg-[#1D366D] text-[#FFFFFF] px-[16px] py-[8px] rounded-none font-bold text-[16px]">
                               {project.totalScore.toFixed(2)}
                             </span>
                           ) : (
                             <span className="text-[12px] text-[#A1A1A5] uppercase tracking-widest font-bold">Pending</span>
                           )}
                         </td>
                         <td className="p-[16px] max-w-[300px]">
                           <div className="truncate text-[#464C59] text-[13px]" title={project.comment}>
                             {project.isEvaluated && project.comment ? project.comment : '-'}
                           </div>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConfetti = () => {
    if (revealState !== 'revealed') return null;
    const colors = ['#1D366D', '#2DC84D', '#464C59', '#FFD700', '#C0C0C0', '#CD7F32'];
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(150)].map((_, i) => {
          const left = Math.random() * 100;
          const animDuration = 2 + Math.random() * 3;
          const delay = Math.random() * 1.5;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = 8 + Math.random() * 12;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${left}%`,
                top: '-10%',
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                borderRadius: '0%', 
                animation: `fall ${animDuration}s linear ${delay}s forwards`,
                opacity: 0.9
              }}
            />
          )
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#000000] relative overflow-x-hidden" style={{ fontFamily: "'Bai Jamjuree', sans-serif" }}>
      {}
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield;
        }

        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes slideUpFade {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
      
      {renderConfetti()}

      {}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm transition-opacity">
          <div className="bg-[#FFFFFF] border-[8px] border-[#1D366D] p-[48px] rounded-none shadow-2xl flex flex-col items-center transform scale-100 animate-slide-up text-center max-w-md w-full mx-4 relative">
            <div className="absolute top-0 left-0 w-full h-[8px] bg-[#2DC84D]"></div>
            <div className="mb-[24px]">
              <CheckCircle size={72} className="text-[#2DC84D]" strokeWidth={2} />
            </div>
            <h3 className="text-[32px] font-bold text-[#1D366D] mb-[8px] uppercase tracking-wide">Success</h3>
            <p className="text-[#464C59] text-[16px] font-semibold">บันทึกผลการประเมินโครงการสำเร็จเสร็จสิ้นเรียบร้อยแล้ว</p>
          </div>
        </div>
      )}

      {}
      <header className="bg-[#1D366D] border-b-[4px] border-[#2DC84D] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-[16px] sm:px-[24px] h-[80px] flex items-center justify-between">
          <div className="flex items-center gap-[16px]">
            <div className="bg-[#FFFFFF] p-[8px] rounded-none">
              <Star className="text-[#1D366D]" size={24} />
            </div>
            <h1 className="font-bold text-[24px] uppercase tracking-widest text-[#FFFFFF] hidden sm:block">
              AAPICO <span className="font-light text-[#2DC84D]">Judge</span>
            </h1>
          </div>
          
          <nav className="flex gap-[8px]">
            <button 
              onClick={() => { setActiveTab('score'); setRevealState('idle'); }}
              className={`flex items-center gap-[8px] px-[24px] py-[12px] rounded-none text-[16px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'score' 
                  ? 'bg-[#2DC84D] text-[#000000]' 
                  : 'text-[#FFFFFF] hover:bg-[#464C59]'
              }`}
            >
              <ClipboardList size={20} /> <span className="hidden sm:inline">Evaluation Form</span>
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-[8px] px-[24px] py-[12px] rounded-none text-[16px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-[#2DC84D] text-[#000000]' 
                  : 'text-[#FFFFFF] hover:bg-[#464C59]'
              }`}
            >
              <BarChart3 size={20} /> <span className="hidden sm:inline">Dashboard</span>
            </button>
          </nav>
        </div>
      </header>

      {}
      <main className="max-w-7xl mx-auto px-[16px] sm:px-[24px] py-[48px]">
        {activeTab === 'score' ? renderScoringForm() : renderDashboard()}
      </main>
    </div>
  );
}