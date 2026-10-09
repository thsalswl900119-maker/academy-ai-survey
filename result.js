let rows=[], contacts={}, lastLoad=null, loadErr='';
const CODE_KEY='sui_admin_code';
function getCode(){try{return localStorage.getItem(CODE_KEY)||''}catch(e){return ''}}
function setCode(c){try{c?localStorage.setItem(CODE_KEY,c):localStorage.removeItem(CODE_KEY)}catch(e){}}
async function load(){
  const code=getCode(); if(!code)return askCode();
  try{
    const res=await fetch(ENDPOINT+'?key='+encodeURIComponent(code));
    const j=await res.json();
    if(!j.ok){setCode('');return askCode('코드가 맞지 않아요. 다시 입력해 주세요.')}
    rows=j.rows||[]; contacts={}; (j.contacts||[]).forEach((c,i)=>contacts[i]=c); lastLoad=new Date(); loadErr='';
  }catch(e){loadErr='결과를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'}
  renderAdmin();
}
function askCode(msg){
  app.className='app';
  app.innerHTML=`<div class="codebox">${CUP(80)}<h1 style="font-size:24px">만족도 조사 결과</h1><p class="hint">강사 전용 코드를 입력해 주세요</p><input type="password" id="code" autocomplete="off"><p class="err">${esc(msg||'')}</p><button class="btn" id="enter" style="flex:none;width:100%">결과 보기</button></div>`;
  const go=()=>{const v=document.getElementById('code').value.trim();if(v){setCode(v);load()}};
  document.getElementById('enter').onclick=go;
  document.getElementById('code').onkeydown=e=>{if(e.key==='Enter')go()};
}
const SAMPLE=(()=>{const p=(a,i)=>a[i%a.length];return Array.from({length:12},(_,i)=>({role:p(['원장님','원장님','선생님(강사)'],i),subject:p([['수학'],['외국어 (영어·일본어·중국어)'],['국어 (국어·논술·독서)','초등 종합 (보습)'],['수학','과학']],i),grade:p([['초등부','중등부'],['중등부','고등부'],['초등부']],i),exp:p(['거의 처음이었어요','가끔 써 봤어요','거의 처음이었어요','자주 써요'],i),
  sat:p([5,5,4,5,4],i),und:p([4,5,4,5,3],i),prac:p([4,4,3,5,3,5],i),use:p([5,4,5,4],i),rec:p([5,4,5],i),best:p(['AI로 우리 학원 맞춤 문제 만들기','카페스이 AI 활용 사례','AI 프롬프트','브랜딩 · 마케팅 (채널별)'],i),
  hard:p(['[예시] 학원 카드 저장하는 부분이 헷갈렸어요','','[예시] 노트북이 느려서 실습을 놓쳤어요',''],i),want:p([['문제·시험지 만들기','학부모 상담·안내문'],['출결·성적 관리','블로그·인스타·플레이스 홍보'],['오답 관리·클리닉','문제·시험지 만들기']],i),
  pain:p(['[예시] 시험 기간 문제지 만들기','[예시] 학부모 상담 문자',''],i),next:p([['우리 학원 시스템 만들기 (출결·성적)'],['문제·교안 제작 심화','우리 학원 시스템 만들기 (출결·성적)'],['블로그·인스타·플레이스 마케팅 심화']],i),
  paid:p(['네, 참여하고 싶어요','커리큘럼 보고 정할게요','네, 참여하고 싶어요','지금은 어려워요'],i),slot:p([['평일 오전'],['평일 오전','주말'],['평일 오후']],i),msg:p(['[예시] 다음 수업도 꼭 듣고 싶어요','','[예시] 실습 시간이 더 있으면 좋겠어요'],i),at:''}))})();
const f1=x=>x==null||isNaN(x)?'–':x.toFixed(1);
function tally(data,q){const c=Object.fromEntries(q.opts.map(o=>[o,0]));let n=0;for(const r of data){const v=q.multi?(r[q.k]||[]):(r[q.k]?[r[q.k]]:[]);if(v.length)n++;v.forEach(o=>c[o]=(c[o]||0)+1)}return {n,list:Object.entries(c).sort((a,b)=>b[1]-a[1])}}
function avg(data,k){const v=data.map(r=>r[k]).filter(x=>typeof x==='number');return {a:v.length?v.reduce((s,x)=>s+x,0)/v.length:null,d:[1,2,3,4,5].map(s=>v.filter(x=>x===s).length)}}
function bars(t){const mx=Math.max(1,...t.list.map(x=>x[1]));return t.list.map(([o,v])=>`<div class="brow"><span>${esc(o)}</span><span class="t"><i style="width:${v/mx*100}%"></i></span><span class="v">${v}명</span></div>`).join('')}
function renderAdmin(){
  app.className='app wide';
  const data=rows.length?rows:SAMPLE, sample=!rows.length;
  const stars=QS.filter(q=>q.type==='star');
  const S=Object.fromEntries(stars.map(q=>[q.k,avg(data,q.k)]));
  const T=Object.fromEntries(QS.filter(q=>q.opts).map(q=>[q.k,tally(data,q)]));
  const yes=(T.paid.list.find(x=>x[0]==='네, 참여하고 싶어요')||[0,0])[1];
  const low=stars.map(q=>({q,...S[q.k]})).filter(x=>x.a!=null).sort((a,b)=>a.a-b.a)[0];
  const top=k=>T[k].list.filter(x=>x[1]).slice(0,3).map(x=>`${x[0]} ${x[1]}명`).join(' · ')||'–';
  const qn=k=>'Q.'+String(QS.findIndex(q=>q.k===k)+1).padStart(2,'0');
  const cs=Object.values(contacts);
  app.innerHTML=`<div class="ad">
   <div class="ad-head"><div style="display:flex;align-items:center;gap:14px">${CUP(56)}<div><p class="flag">학원 AI 원데이 클래스 · 원장님 전용</p><h1>만족도 조사 응답 모아보기</h1>
     <p class="flag">${loadErr?esc(loadErr):sample?'아직 응답이 없어요. 아래는 예시 데이터예요':'응답 '+rows.length+'명 · 15초마다 자동 새로고침'+(lastLoad?' · '+lastLoad.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}):'')}</p></div></div>
     <div class="tools"><button type="button" id="refresh">지금 새로고침</button><a href="./" style="font-size:13.5px;padding:11px 14px;border-radius:6px;border:1px solid var(--line-2);background:var(--paper);color:var(--ink);text-decoration:none">설문 화면</a><button type="button" id="csv">엑셀용 표 복사</button><button type="button" class="main" id="ai">AI 분석 질문 복사</button></div></div>
   <p class="flag" id="msg" role="status"></p>
   <div class="kpis">
     <div class="kpi"><span>총 응답</span><b>${data.length}</b><small>${sample?'예시':'명'}</small></div>
     <div class="kpi"><span>전체 만족도</span><b>${f1(S.sat.a)}</b><small>5점 만점</small></div>
     <div class="kpi"><span>이해도</span><b>${f1(S.und.a)}</b><small>5점 만점</small></div>
     <div class="kpi"><span>실습 참여</span><b>${f1(S.prac.a)}</b><small>5점 만점</small></div>
     <div class="kpi"><span>정규 수업 참여 의향</span><b>${T.paid.n?Math.round(yes/T.paid.n*100):0}%</b><small>"참여하고 싶어요" ${yes}명</small></div>
   </div>
   <div class="sum"><h2>한눈에 보기</h2><p>원장님들이 가장 원하는 업무: ${esc(top('want'))}</p><p>다음에 듣고 싶은 수업: ${esc(top('next'))}</p><p>가장 낮은 점수: ${low?esc(low.q.label)+' '+f1(low.a)+'점 → 다음 수업에서 보완':'–'}</p></div>
   <div class="cards">
     <div class="card"><span class="qno">${qn('sat')}–${qn('rec')}</span><h2>만족도 · 이해도 · 반응도</h2>${stars.map(q=>`<div class="srow"><div>${esc(q.label)}<div class="t"><i style="width:${(S[q.k].a||0)/5*100}%"></i></div></div><span class="avg">${f1(S[q.k].a)}</span></div>`).join('')}</div>
     ${['want','next','paid','best','slot','exp','role','grade','subject'].map(k=>`<div class="card"><span class="qno">${qn(k)}</span><h2>${esc(QS.find(q=>q.k===k).t)}</h2>${bars(T[k])}</div>`).join('')}
   </div>
   <div class="cards">${QS.filter(q=>q.type==='text').map(q=>{const it=data.map(r=>r[q.k]).filter(Boolean);return `<div class="card"><span class="qno">${qn(q.k)} · ${it.length}건</span><h2>${esc(q.t)}</h2>${it.length?it.map(t=>`<div class="cm">${esc(t)}</div>`).join(''):'<p class="flag">아직 없어요</p>'}</div>`}).join('')}
     <div class="card"><span class="qno">${qn('contact')} · 원장님만 보여요</span><h2>다음 수업 안내 신청 ${cs.length}명</h2>${cs.length?cs.map(c=>`<div class="cm">${esc(c.name)}<small>${esc(c.phone)}</small></div>`).join(''):'<p class="flag">아직 신청한 분이 없어요</p>'}</div></div>
  </div>`;
  document.getElementById('refresh').onclick=load;
  document.getElementById('csv').onclick=()=>copy(toTSV(data),'엑셀용 표를 복사했어요. 엑셀에 붙여 넣으세요.');
  document.getElementById('ai').onclick=()=>copy(aiPrompt(data,S,T),'복사했어요. ChatGPT나 Claude에 붙여 넣으세요.');
}
function toTSV(data){const ks=QS.filter(q=>q.type!=='contact');const cell=v=>Array.isArray(v)?v.join(', '):String(v??'').replace(/\s+/g,' ');
  return ['응답 시각\t'+ks.map(q=>q.label||q.t).join('\t'),...data.map(r=>[r.at||'',...ks.map(q=>cell(r[q.k]))].join('\t'))].join('\n')}
function aiPrompt(data,S,T){let s=`당신은 성인 대상 실무 강의를 평가하고 다음 과정을 기획하는 교육 컨설턴트입니다.\n아래는 학원 원장님·선생님 대상 "학원 실무에 사용하는 AI 활용 원데이 클래스" 수강 후 설문 결과입니다. 응답 ${data.length}명.\n\n[5점 척도 평균]\n`;
  for(const q of QS.filter(q=>q.type==='star'))s+=`- ${q.label}: ${f1(S[q.k].a)} (5점→1점 인원: ${[...S[q.k].d].reverse().join('/')})\n`;
  for(const q of QS.filter(q=>q.opts))s+=`\n[${q.t}]\n`+T[q.k].list.map(([o,v])=>`- ${o}: ${v}명`).join('\n')+'\n';
  for(const q of QS.filter(q=>q.type==='text'))s+=`\n[${q.t}]\n`+(data.map(r=>r[q.k]).filter(Boolean).map(t=>'- '+t).join('\n')||'- 없음')+'\n';
  return s+`\n요청:\n1. 잘된 점 3가지, 보완할 점 3가지를 숫자 근거와 함께 정리\n2. 주관식 의견을 주제별로 묶어 건수와 함께 정리\n3. 원장님들이 가장 원하는 업무를 바탕으로 유료 정규 수업 「우리 학원 시스템 만들기」 4회차 커리큘럼 초안 (회차/주제/실습 결과물 표)\n4. 응답에서 확인되지 않는 내용은 지어내지 말고 "확인 필요"로 표시`}
async function copy(text,ok){const m=document.getElementById('msg');try{await navigator.clipboard.writeText(text);m.textContent=ok}catch(e){m.textContent='복사가 막혀 있어요. 아래 내용을 직접 선택해 복사해 주세요.';const p=document.createElement('textarea');p.value=text;p.rows=8;m.after(p);p.select()}}
load();
setInterval(()=>{if(getCode())load()},15000);
