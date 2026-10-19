const starSvg=on=>`<svg viewBox="0 0 24 24" stroke="#A85A45" stroke-width="1.2" stroke-linejoin="round" fill="${on?'#E3A587':'none'}"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/></svg>`;
function qHtml(q,n){
  const v=ans[q.k], on=o=>q.multi?(v||[]).includes(o):v===o;
  let h=`<div class="${q.type==='star'?'rate':'q'}" data-k="${q.k}"><div class="qno">Q.${String(n).padStart(2,'0')}</div><h2>${esc(q.t)}</h2>`;
  if(q.hint)h+=`<p class="hint">${esc(q.hint)}</p>`;
  if(q.type==='radio'||q.type==='list')h+=`<div class="list">${q.opts.map(o=>`<button type="button" class="radio${q.multi?' box':''}" data-o="${esc(o)}" aria-pressed="${on(o)}"><span class="dot"></span>${esc(o)}</button>`).join('')}</div>`;
  if(q.type==='chips')h+=`<div class="chips">${q.opts.map(o=>`<button type="button" class="chip" data-o="${esc(o)}" aria-pressed="${on(o)}">${esc(o)}</button>`).join('')}</div>`;
  if(q.type==='star')h+=`<div class="stars"><div>${[1,2,3,4,5].map(i=>`<button type="button" class="star" data-o="${i}" aria-label="${i}점 ${STAR_NAMES[i-1]}" aria-pressed="${v===i}">${starSvg(v>=i)}</button>`).join('')}</div><span class="rlabel">${v?STAR_NAMES[v-1]:''}</span></div>`;
  if(q.type==='text')h+=`<textarea id="f-${q.k}" data-text="${q.k}" rows="4" placeholder="${esc(q.ph||'')}">${esc(v||'')}</textarea>`;
  if(q.type==='contact')h+=`<div class="gift"><p class="hint" style="color:var(--ink-2)">정규 수업 일정이 나오면 가장 먼저 알려드릴게요. 원하지 않으시면 비워 두셔도 돼요.</p>
    <button type="button" class="radio box" data-agree aria-pressed="${!!ans.agree}" style="border:0;padding:4px 0"><span class="dot"></span><span>개인정보(이름·연락처) 수집에 동의해요<br><small style="color:var(--ink-3)">수업 안내에만 쓰고 6개월 뒤 삭제합니다</small></span></button>
    <input type="text" id="f-name" placeholder="성함 / 학원 이름" value="${esc(ans.name||'')}" ${ans.agree?'':'disabled'}>
    <input type="tel" id="f-phone" inputmode="numeric" placeholder="010-0000-0000" value="${esc(ans.phone||'')}" ${ans.agree?'':'disabled'}></div>`;
  return h+'</div>';
}
const header=i=>`<div class="top"><div class="row">${CUP(40)}<span class="count">${String(i+1).padStart(2,'0')} / 05 · ${esc(STEPS[i].title)}</span></div><div class="bar">${STEPS.map((_,j)=>`<i class="${j<=i?'on':''}"></i>`).join('')}</div></div>`;
const numBefore=i=>STEPS.slice(0,i).reduce((a,s)=>a+s.qs.length,0);
function render(){
  app.className='app';
  if(step===-1){
    app.innerHTML=`<div class="hero"><div class="cupwrap">${CUP(70)}</div><span class="tag">학원 실무에 사용하는 AI 활용 원데이 클래스</span><h1>오늘 수업,<br>어떠셨나요?</h1><p>3분이면 끝나요. 남겨 주신 이야기로 다음 수업 「우리 학원 시스템 정리하고 한데 모으기」를 만듭니다.</p></div>
      <div class="facts"><div><span>문항</span><b>5단계 · 17문항</b></div><div><span>걸리는 시간</span><b>약 3분</b></div><div><span>응답 방식</span><b>익명 (연락처는 선택)</b></div></div>
      <div style="flex:1"></div><div class="nav"><button class="btn" id="go">설문 시작하기</button></div>`;
    document.getElementById('go').onclick=()=>{step=0;render();scrollTo(0,0)};
    return;
  }
  if(step===STEPS.length)return renderDone();
  const s=STEPS[step], base=numBefore(step);
  app.innerHTML=header(step)+`<div class="step">${s.qs.map((q,j)=>qHtml(q,base+j+1)).join('')}</div>
    <p class="err" id="err" role="alert"></p>
    <div class="nav"><button class="btn ghost" id="prev">이전</button><button class="btn" id="next">${step===STEPS.length-1?'제출하기':'다음'}</button></div>`;
  bind();
}
function rerenderKeep(){const y=scrollY;render();scrollTo(0,y)}
function bind(){
  app.querySelectorAll('[data-k]').forEach(box=>{
    const q=QS.find(x=>x.k===box.dataset.k);
    box.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{
      const o=q.type==='star'?+b.dataset.o:b.dataset.o;
      if(q.multi){const a=new Set(ans[q.k]||[]);a.has(o)?a.delete(o):a.add(o);ans[q.k]=[...a]}else ans[q.k]=o;
      keepContact();rerenderKeep();
    });
  });
  app.querySelectorAll('[data-text]').forEach(t=>t.oninput=()=>ans[t.dataset.text]=t.value);
  const ag=app.querySelector('[data-agree]');
  if(ag)ag.onclick=()=>{keepContact();ans.agree=!ans.agree;if(!ans.agree){ans.name='';ans.phone=''}rerenderKeep()};
  document.getElementById('prev').onclick=()=>{keepContact();step--;render();scrollTo(0,0)};
  document.getElementById('next').onclick=next;
}
function keepContact(){const n=document.getElementById('f-name'),p=document.getElementById('f-phone');if(n)ans.name=n.value.trim();if(p)ans.phone=p.value.trim()}
async function next(){
  keepContact();
  const miss=STEPS[step].qs.filter(q=>q.req&&!(q.multi?(ans[q.k]||[]).length:ans[q.k]));
  if(miss.length){document.getElementById('err').textContent='아직 답하지 않은 문항이 있어요: '+miss.map(q=>q.label||q.t).join(', ');app.querySelector(`[data-k="${miss[0].k}"]`).scrollIntoView({block:'center'});return}
  if(step<STEPS.length-1){step++;render();scrollTo(0,0);return}
  const b=document.getElementById('next');b.disabled=true;b.textContent='보내는 중…';
  saved=await save();step++;render();scrollTo(0,0);
}
async function save(){
  if(!ENDPOINT)return false;
  const r={};
  for(const q of QS){if(q.type==='contact')continue;const v=ans[q.k];if(v!=null&&v!==''&&!(Array.isArray(v)&&!v.length))r[q.k]=v}
  if(ans.agree&&(ans.name||ans.phone)){r.name=ans.name||'';r.phone=ans.phone||''}
  const body=JSON.stringify(r);
  try{const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body});const j=await res.json();return !!j.ok}
  catch(e){try{await fetch(ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body});return true}catch(e2){return false}}
}
function renderDone(){
  app.innerHTML=`<div class="done">${CUP(84)}<h1 style="font-size:26px;margin-top:6px">소중한 의견 고맙습니다!</h1><p class="hint" style="font-size:14px;color:var(--ink-2)">이어서 Q&amp;A 시간이에요. 궁금한 건 편하게 물어봐 주세요.</p>
    ${saved?'':`<p class="notice">인터넷 연결 문제로 응답이 저장되지 않았어요. 처음으로 돌아가 다시 제출해 주세요.</p>`}
    <div class="ticket" style="margin-top:12px"><header>NEXT CLASS</header><div class="body"><b style="font-family:var(--serif);font-size:21px">우리 학원 시스템 정리하고 한데 모으기</b><span class="hint" style="color:var(--ink-2)">운영 · 수업 · 브랜드·마케팅 7개 항목 · 수업자료 만들기 · 우리 학원 링크 배포까지 · 항목별로 신청</span></div><div class="cut"></div>
    <div class="body"><div class="line"><span>안내</span><b>${ans.agree&&ans.phone?'남겨 주신 번호로 먼저 연락드려요':'원데이 클래스 수강생께 먼저'}</b></div><div class="line"><span>강사</span><b>손민지 · 카페스이 대표</b></div></div></div>
    <div style="flex:1"></div><p class="hint" style="padding-top:24px">남겨 주신 이야기 꼼꼼히 읽고 더 좋은 수업으로 보답할게요</p>
    <button type="button" class="btn ghost" id="again" style="flex:none;padding:12px 18px;margin-top:10px">처음으로</button></div>`;
  document.getElementById('again').onclick=()=>{ans={};step=-1;saved=null;render();scrollTo(0,0)};
}
render();
