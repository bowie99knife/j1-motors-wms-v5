import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "zh-CN" | "ko";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
});

const zh: Record<string, string> = {
  "Choose date": "选择日期",
  "Choose time": "选择时间",
  "Your details": "填写资料",
  "Step 1": "步骤 1",
  "Step 2": "步骤 2",
  "Step 3": "步骤 3",
  "Select a date": "选择日期",
  "Select an available time": "选择可用时间",
  "Enter your details": "填写您的资料",
  "Change date": "更改日期",
  "Change time": "更改时间",
  "Checking availability…": "正在查询可用时间…",
  "Available": "可预约",
  "Unavailable": "不可预约",
  "No appointments are available on this date. Please choose another date.": "该日期没有可用预约，请选择其他日期。",
  "Please select an available date and time.": "请选择可用的日期和时间。",
  "That time is no longer available. Please choose another time.": "该时间已不可预约，请选择其他时间。",
  "Full name": "姓名",
  "Registration": "车牌号码",
  "Home": "首页",
  "Book": "预约",
  "Quotation": "报价",
  "Track": "查询进度",
  "Location": "地点",
  "Staff": "员工登录",
  "All cars. All work. All purpose.": "所有车型，所有维修，一站式服务。",
  "J1 Motors": "J1 汽车维修",
  "Car Repairs": "汽车维修",
  "Professional workmanship. Honest service. Your car, our passion.": "专业手艺，诚信服务。您的爱车，我们的热情。",
  "Book appointment": "预约维修",
  "Request quotation": "申请报价",
  "Workshop Hours": "营业时间",
  "8:30 AM–5:00 PM": "上午 8:30 – 下午 5:00",
  "Monday to Friday": "星期一至星期五",
  "All Cars": "所有车型",
  "All makes and models welcome.": "欢迎所有品牌和车型。",
  "All Work": "全面维修",
  "Repairs, diagnostics and servicing.": "维修、诊断与保养。",
  "Customer First": "顾客至上",
  "Clear communication and honest advice.": "清楚沟通，诚实建议。",
  "Customer portal": "客户服务",
  "Book an appointment": "预约维修",
  "Request a quotation": "申请报价",
  "Track repair": "查询维修进度",
  "Enter the registration and phone number used for the booking or job card.": "请输入预约或工单使用的车牌号码和电话号码。",
  "Vehicle registration": "车牌号码",
  "Phone number": "电话号码",
  "Track vehicle": "查询车辆",
  "Enter both registration and phone number.": "请输入车牌号码和电话号码。",
  "Searching…": "查询中…",
  "No matching vehicle record found.": "找不到相符的车辆记录。",
  "Job number:": "工单编号：",
  "Status:": "状态：",
  "Appointment:": "预约：",
  "Estimated completion:": "预计完成时间：",
  "Staff Portal": "员工登录",
  "Authorised personnel only": "仅限授权员工",
  "Staff ID": "员工编号",
  "Password": "密码",
  "Sign in": "登录",
  "Invalid Staff ID or password.": "员工编号或密码不正确。",
  "Welcome,": "欢迎，",
  "Sign out": "退出登录",
  "Bookings": "预约",
  "View customer appointments.": "查看客户预约。",
  "Job Cards": "工单",
  "Create, upload and update workshop jobs.": "建立、上传和更新维修工单。",
  "Quote Requests": "报价申请",
  "Admin access only.": "仅限管理员。",
  "Revenue": "营业收入",
  "Staff Management": "员工管理",
  "Workshop": "车间",
  "New job": "新建工单",
  "Open": "打开",
  "New Job Card": "新建工单",
  "Save job card": "保存工单",
  "Upload photos": "上传照片",
  "Save the job card before uploading photos.": "请先保存工单，再上传照片。",
  "Admin only": "仅限管理员",
  "Customer name": "客户姓名",
  "Customer phone": "客户电话",
  "Customer email": "客户电邮",
  "Rego": "车牌号码",
  "Make": "品牌",
  "Model": "车型",
  "Year": "年份",
  "Odometer": "里程",
  "Engine code": "发动机代码",
  "Transmission": "变速箱",
  "Customer concern": "客户问题描述",
  "Findings": "检查结果",
  "Fault codes": "故障码",
  "Diagnosis": "诊断",
  "Rectification": "维修处理",
  "Recommendations": "建议",
  "Status": "状态",
  "Name": "姓名",
  "Phone": "电话",
  "Email": "电邮",
  "Preferred date": "首选日期",
  "Preferred time": "首选时间",
  "Service": "服务项目",
  "Concern": "问题描述",
  "Submit booking": "提交预约",
  "Work required": "所需维修",
  "Submit request": "提交申请",
  "Quotation request received. Tracking reference:": "报价申请已收到。查询编号：",
  "Booking received. Tracking reference:": "预约已收到。查询编号：",
  "Website preview mode: cloud database is not connected yet.": "网站预览模式：云端数据库尚未连接。",
  "English": "English",
  "Simplified Chinese": "简体中文",
  "Korean": "한국어",
  "Language": "语言",
  "Loading…": "加载中…",
  "Active": "启用",
  "Disabled": "停用",
  "admin": "管理员",
  "workshop manager": "车间经理",
  "mechanic": "维修技师",
  "apprentice": "学徒",
  "Booked": "已预约",
  "Checked In": "已入厂",
  "Diagnosing": "诊断中",
  "Waiting Approval": "等待批准",
  "Repair In Progress": "维修中",
  "Waiting Parts": "等待零件",
  "Quality Check": "质量检查",
  "Completed": "已完成",
  "Collected": "已取车",
  "Cancelled": "已取消",
};

const ko: Record<string, string> = {
  "Choose date": "날짜 선택",
  "Choose time": "시간 선택",
  "Your details": "고객 정보",
  "Step 1": "1단계",
  "Step 2": "2단계",
  "Step 3": "3단계",
  "Select a date": "날짜를 선택하세요",
  "Select an available time": "예약 가능한 시간을 선택하세요",
  "Enter your details": "고객 정보를 입력하세요",
  "Change date": "날짜 변경",
  "Change time": "시간 변경",
  "Checking availability…": "예약 가능 시간 확인 중…",
  "Available": "예약 가능",
  "Unavailable": "예약 불가",
  "No appointments are available on this date. Please choose another date.": "선택한 날짜에는 예약 가능한 시간이 없습니다. 다른 날짜를 선택하세요.",
  "Please select an available date and time.": "예약 가능한 날짜와 시간을 선택하세요.",
  "That time is no longer available. Please choose another time.": "해당 시간은 더 이상 예약할 수 없습니다. 다른 시간을 선택하세요.",
  "Full name": "성명",
  "Registration": "차량 등록번호",
  "Home": "홈",
  "Book": "예약",
  "Quotation": "견적",
  "Track": "정비 조회",
  "Location": "위치",
  "Staff": "직원 로그인",
  "All cars. All work. All purpose.": "모든 차량, 모든 정비, 한 곳에서.",
  "J1 Motors": "J1 모터스",
  "Car Repairs": "자동차 정비",
  "Professional workmanship. Honest service. Your car, our passion.": "전문적인 기술과 정직한 서비스. 고객님의 차량이 우리의 열정입니다.",
  "Book appointment": "정비 예약",
  "Request quotation": "견적 요청",
  "Workshop Hours": "영업시간",
  "8:30 AM–5:00 PM": "오전 8:30 – 오후 5:00",
  "Monday to Friday": "월요일–금요일",
  "All Cars": "모든 차량",
  "All makes and models welcome.": "모든 제조사와 모델을 환영합니다.",
  "All Work": "종합 정비",
  "Repairs, diagnostics and servicing.": "수리, 진단 및 정기점검.",
  "Customer First": "고객 우선",
  "Clear communication and honest advice.": "명확한 안내와 정직한 조언.",
  "Customer portal": "고객 포털",
  "Book an appointment": "정비 예약",
  "Request a quotation": "견적 요청",
  "Track repair": "정비 진행 조회",
  "Enter the registration and phone number used for the booking or job card.": "예약 또는 작업지시서에 사용한 차량번호와 전화번호를 입력하세요.",
  "Vehicle registration": "차량 등록번호",
  "Phone number": "전화번호",
  "Track vehicle": "차량 조회",
  "Enter both registration and phone number.": "차량 등록번호와 전화번호를 모두 입력하세요.",
  "Searching…": "조회 중…",
  "No matching vehicle record found.": "일치하는 차량 기록이 없습니다.",
  "Job number:": "작업번호:",
  "Status:": "상태:",
  "Appointment:": "예약:",
  "Estimated completion:": "예상 완료 시간:",
  "Staff Portal": "직원 포털",
  "Authorised personnel only": "승인된 직원만 이용 가능",
  "Staff ID": "직원 ID",
  "Password": "비밀번호",
  "Sign in": "로그인",
  "Invalid Staff ID or password.": "직원 ID 또는 비밀번호가 올바르지 않습니다.",
  "Welcome,": "환영합니다,",
  "Sign out": "로그아웃",
  "Bookings": "예약",
  "View customer appointments.": "고객 예약을 확인합니다.",
  "Job Cards": "작업지시서",
  "Create, upload and update workshop jobs.": "작업지시서를 생성하고 사진 및 내용을 업데이트합니다.",
  "Quote Requests": "견적 요청",
  "Admin access only.": "관리자 전용.",
  "Revenue": "매출",
  "Staff Management": "직원 관리",
  "Workshop": "정비소",
  "New job": "새 작업",
  "Open": "열기",
  "New Job Card": "새 작업지시서",
  "Save job card": "작업지시서 저장",
  "Upload photos": "사진 업로드",
  "Save the job card before uploading photos.": "사진을 업로드하기 전에 작업지시서를 저장하세요.",
  "Admin only": "관리자 전용",
  "Customer name": "고객 이름",
  "Customer phone": "고객 전화",
  "Customer email": "고객 이메일",
  "Rego": "차량 등록번호",
  "Make": "제조사",
  "Model": "모델",
  "Year": "연식",
  "Odometer": "주행거리",
  "Engine code": "엔진 코드",
  "Transmission": "변속기",
  "Customer concern": "고객 요청사항",
  "Findings": "점검 결과",
  "Fault codes": "고장 코드",
  "Diagnosis": "진단",
  "Rectification": "수리 내용",
  "Recommendations": "권장 사항",
  "Status": "상태",
  "Name": "이름",
  "Phone": "전화",
  "Email": "이메일",
  "Preferred date": "희망 날짜",
  "Preferred time": "희망 시간",
  "Service": "서비스",
  "Concern": "증상 및 요청사항",
  "Submit booking": "예약 제출",
  "Work required": "필요한 작업",
  "Submit request": "요청 제출",
  "Quotation request received. Tracking reference:": "견적 요청이 접수되었습니다. 조회 번호:",
  "Booking received. Tracking reference:": "예약이 접수되었습니다. 조회 번호:",
  "Website preview mode: cloud database is not connected yet.": "웹사이트 미리보기 모드: 클라우드 데이터베이스가 아직 연결되지 않았습니다.",
  "English": "English",
  "Simplified Chinese": "简体中文",
  "Korean": "한국어",
  "Language": "언어",
  "Loading…": "로딩 중…",
  "Active": "활성",
  "Disabled": "비활성",
  "admin": "관리자",
  "workshop manager": "정비소 매니저",
  "mechanic": "정비사",
  "apprentice": "견습생",
  "Booked": "예약됨",
  "Checked In": "입고 완료",
  "Diagnosing": "진단 중",
  "Waiting Approval": "승인 대기",
  "Repair In Progress": "수리 중",
  "Waiting Parts": "부품 대기",
  "Quality Check": "품질 점검",
  "Completed": "완료",
  "Collected": "출고 완료",
  "Cancelled": "취소됨",
};

const dictionaries: Record<Language, Record<string, string>> = {
  en: {},
  "zh-CN": zh,
  ko,
};

const originalText = new WeakMap<Text, string>();
const originalAttrs = new WeakMap<Element, Record<string, string>>();

function translateExact(value: string, language: Language): string {
  if (language === "en") return value;
  const dictionary = dictionaries[language];
  const trimmed = value.trim();
  if (!trimmed) return value;

  if (dictionary[trimmed]) {
    return value.replace(trimmed, dictionary[trimmed]);
  }

  for (const [english, translated] of Object.entries(dictionary)) {
    if (trimmed.startsWith(english) && english.endsWith(":")) {
      return value.replace(english, translated);
    }
  }
  return value;
}

function translateTree(root: ParentNode, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "CODE", "PRE"].includes(parent.tagName)) continue;
    const original = originalText.get(textNode) ?? textNode.nodeValue ?? "";
    originalText.set(textNode, original);
    const next = translateExact(original, language);
    if (textNode.nodeValue !== next) textNode.nodeValue = next;
  }

  root.querySelectorAll?.("input, textarea, select, button").forEach((element) => {
    const stored = originalAttrs.get(element) ?? {};
    for (const attribute of ["placeholder", "aria-label", "title"]) {
      const current = element.getAttribute(attribute);
      if (current && stored[attribute] === undefined) stored[attribute] = current;
      if (stored[attribute] !== undefined) {
        element.setAttribute(attribute, translateExact(stored[attribute], language));
      }
    }
    originalAttrs.set(element, stored);
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("j1-language") as Language | null;
    return saved && ["en", "zh-CN", "ko"].includes(saved) ? saved : "en";
  });
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    localStorage.setItem("j1-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";

    const apply = () => translateTree(document.body, language);
    apply();

    observerRef.current?.disconnect();
    observerRef.current = new MutationObserver(() => {
      observerRef.current?.disconnect();
      apply();
      observerRef.current?.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    });
    observerRef.current.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => observerRef.current?.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => setLanguageState(next),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <label className="languageSelector" aria-label="Language">
      <span>Language</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        <option value="en">English</option>
        <option value="zh-CN">简体中文</option>
        <option value="ko">한국어</option>
      </select>
    </label>
  );
}
