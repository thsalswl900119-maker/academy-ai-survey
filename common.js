const CUP=(w=44)=>`<img class="cup" src="cup.png" alt="카페스이" width="${w}" height="${Math.round(w*.93)}">`;
const STAR_NAMES=['전혀 아니다','아니다','보통','그렇다','매우 그렇다'];
const STEPS=[
 {title:'기본 정보', qs:[
  {k:'role',t:'오늘 어떤 자리로 오셨나요?',type:'radio',opts:['원장님','선생님(강사)','기타'],req:1},
  {k:'grade',t:'담당 학년은 어떻게 되세요?',hint:'여러 개 골라도 돼요',type:'chips',multi:1,opts:['유아부','초등부','중등부','고등부','성인부']},
  {k:'subject',t:'담당 과목을 골라 주세요',hint:'여러 개 골라도 돼요',type:'list',multi:1,opts:['국어 (국어·논술·독서)','수학','외국어 (영어·일본어·중국어)','과학','사회','초등 종합 (보습)','예체능 (미술·음악·체육)','기타 (코딩 등)']},
  {k:'exp',t:'수업 전에 AI를 써 보셨나요?',type:'radio',opts:['거의 처음이었어요','가끔 써 봤어요','자주 써요'],req:1}]},
 {title:'만족도', qs:[
  {k:'sat',t:'오늘 수업, 전체적으로 만족하셨나요?',type:'star',label:'전체 만족도',req:1},
  {k:'und',t:'설명이 이해하기 쉬웠나요?',type:'star',label:'이해도',req:1},
  {k:'prac',t:'실습을 끝까지 따라오실 수 있었나요?',type:'star',label:'실습 참여',req:1},
  {k:'use',t:'배운 내용을 우리 학원에 바로 써 볼 수 있겠나요?',type:'star',label:'현장 활용도',req:1},
  {k:'rec',t:'주변 원장님께 이 수업을 추천하시겠어요?',type:'star',label:'추천 의향',req:1}]},
 {title:'수업 돌아보기', qs:[
  {k:'best',t:'가장 도움이 된 파트는 어디였나요?',type:'radio',opts:['카페스이 AI 활용 사례','브랜딩 · 마케팅 (채널별)','AI 프롬프트','AI로 우리 학원 맞춤 문제 만들기'],req:1},
  {k:'hard',t:'어렵거나 설명이 더 필요했던 부분이 있었나요?',type:'text',ph:'예) 학원 카드 저장하는 부분이 헷갈렸어요'}]},
 {title:'우리 학원에 필요한 것', qs:[
  {k:'want',t:'AI로 학원에 접목하고 싶은 업무를 골라 주세요',hint:'여러 개 골라도 돼요',type:'list',multi:1,opts:['문제·시험지 만들기','오답 관리·클리닉','출결·성적 관리','학부모 상담·안내문','수업 교안·자료 만들기','블로그·인스타·플레이스 홍보','신규 원생 상담·등록','강사 관리·시간표','수납·회계','기타'],req:1},
  {k:'pain',t:'요즘 가장 시간을 많이 잡아먹는 학원 업무는 무엇인가요?',type:'text',ph:'편하게 적어 주세요'}]},
 {title:'다음 수업', qs:[
  {k:'next',t:'다음에 배우고 싶은 항목을 골라 주세요',hint:'여러 개 골라도 돼요',type:'list',multi:1,opts:['★ 나만의 링크 만들어 배포하기 (1회차)','브랜딩 & 마케팅 (2회차)','교육청 서류·지침 한데 모으기','출결 관리','학생 상담 기록지','채점 자동화 (학생별 강점·약점 분석)','수업자료 만들기 (개념 정리지·학습지·쪽지시험)','우리 학원 1:1 컨설팅'],req:1},
  {k:'paid',t:'다음 수업(항목별 유료)에 참여하실 생각이 있으세요?',type:'radio',opts:['네, 참여하고 싶어요','커리큘럼 보고 정할게요','지금은 어려워요'],req:1},
  {k:'slot',t:'수업하기 좋은 시간대는요?',hint:'여러 개 골라도 돼요',type:'chips',multi:1,opts:['평일 오전','평일 오후','주말']},
  {k:'msg',t:'강사에게 하고 싶은 말을 편하게 남겨 주세요',type:'text',ph:'응원도, 아쉬운 점도 모두 다음 수업에 반영할게요'},
  {k:'contact',t:'다음 수업 소식을 받아보시겠어요?',type:'contact'}]}
];
const QS=STEPS.flatMap(s=>s.qs);
const app=document.getElementById('app');
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let ans={}, step=-1, saved=null, view='survey';
const ENDPOINT=window.SURVEY_ENDPOINT||'';
