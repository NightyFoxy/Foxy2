
(() => {
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
  const APP = $('#app');
  const FOX = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjRkY5NDY2Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGNkEwMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHJ4PSIyNCIgZmlsbD0iIzFhMWExYSIvPgogIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2LDIwKSI+CiAgICA8cGF0aCBkPSJNMTYgNDIgQzE2IDIwLCA0NiAwLCA0OCAwIEM1MCAwLCA4MCAyMCwgODAgNDIgQzgwIDY2LCA2MCA4MCwgNDggODAgQzM2IDgwLCAxNiA2NiwgMTYgNDIgWiIgZmlsbD0idXJsKCNnKSIvPgogICAgPHBhdGggZD0iTTIyIDQ2IGM4LTYgMTQtNiAyMiAwIGMtMyAxMi0xNiAxOC0yMiAweiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTQ4IDQ2IGM4LTYgMTQtNiAyMiAwIGMtMyAxMi0xNiAxOC0yMiAweiIgZmlsbD0iI2ZmZiIvPgogICAgPGNpcmNsZSBjeD0iNDAiIGN5PSI1MCIgcj0iMy41IiBmaWxsPSIjMWExYTFhIi8+CiAgICA8Y2lyY2xlIGN4PSI1OCIgY3k9IjUwIiByPSIzLjUiIGZpbGw9IiMxYTFhMWEiLz4KICAgIDxwYXRoIGQ9Ik00MiA2NCBjNCA0IDggNCAxMiAwIiBzdHJva2U9IiMxYTFhMWEiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxwYXRoIGQ9Ik0xMCAzNCBDOCAyNCwgMiAxOSwgLTMgMTcgQzQgMTQsIDE2IDE3LCAyMiAyNiBaIiBmaWxsPSJ1cmwoI2cpIi8+CiAgICA8cGF0aCBkPSJNODYgMzQgQzg4IDI0LCA5NCAxOSwgOTkgMTcgQzkyIDE0LCA4MCAxNywgNzQgMjYgWiIgZmlsbD0idXJsKCNnKSIvPgogIDwvZz4KPC9zdmc+";

  // Theme
  const THEME_KEY = 'foxy.v12.theme';
  function applyTheme(name){ 
    if(name==='light') document.documentElement.classList.add('theme-light'); 
    else document.documentElement.classList.remove('theme-light');
    localStorage.setItem(THEME_KEY, name==='light'?'light':'dark');
  }
  applyTheme(localStorage.getItem(THEME_KEY)||'dark');

  // State
  const SKEY = 'foxy.v12.state';
  const DKEY = 'foxy.v12.days';
  const state = load(SKEY, { completed:false, answers:{}, view:'welcome' });
  const days = load(DKEY, {});
  function load(k, def){ try{ return JSON.parse(localStorage.getItem(k)||'null') ?? def }catch{ return def } }
  function save(k, v){ localStorage.setItem(k, JSON.stringify(v)) }
  function go(view){ state.view=view; save(SKEY, state); render(); }

  // Helpers
  const addDays = (d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
  const fmtISO = d => d.toISOString().slice(0,10);
  const fmtPretty = d => d.toLocaleDateString('ru-RU', { month:'long', year:'numeric' });
  const range = n => Array.from({length:n}, (_,i)=>i);

  function predict({ lastStart, cycleLen=28, periodLen=5 }){
    const start = new Date(lastStart);
    const nextStart = addDays(start, cycleLen);
    const fertileStart = addDays(start, cycleLen - 14 - 2);
    const fertileEnd = addDays(start, cycleLen - 14 + 2);
    const periodDays = range(periodLen).map(i => fmtISO(addDays(start, i)));
    return { start: fmtISO(start), nextStart: fmtISO(nextStart), fertileStart: fmtISO(fertileStart), fertileEnd: fmtISO(fertileEnd), periodDays };
  }

  render();

  function render(){
    APP.innerHTML = '';
    APP.appendChild(Header());
    if(!state.completed){ APP.appendChild(Onboarding()); return; }
    const container = document.createElement('div'); container.className='container'; APP.appendChild(container);
    if(state.view==='welcome') container.appendChild(WelcomeView());
    else if(state.view==='calendar') container.appendChild(CalendarView());
    else if(state.view==='advice') container.appendChild(AdviceView());
    else if(state.view==='help') container.appendChild(HelpView());
    else if(state.view==='assistant') container.appendChild(AssistantView());
    else container.appendChild(WelcomeView());
    APP.appendChild(Drawer());
  }

  function Header(){
    const h = document.createElement('div'); h.className='header';
    h.innerHTML = `
      <div class="container row">
        <button id="hamb" class="hamburger"><div>
          <span></span><span></span><span></span>
        </div></button>
        <div class="brand">
          <img src="${FOX}" alt="Foxy">
          <div class="name">Foxy</div>
        </div>
        <div style="width:28px"></div>
      </div>`;
    h.querySelector('#hamb').onclick = () => openDrawer(true);
    return h;
  }

  function openDrawer(v){ const dr = $('#drawer'); if(!dr) return; dr.classList.toggle('show', v); }
  function Drawer(){
    const d = document.createElement('div'); d.id='drawer'; d.className='drawer';
    d.innerHTML = `
      <div class="drawer-panel">
        <a href="#" data-view="welcome" class="${state.view==='welcome'?'active':''}">Приветствие</a>
        <a href="#" data-view="assistant" class="${state.view==='assistant'?'active':''}">ИИ ассистент</a>
        <a href="#" data-view="calendar" class="${state.view==='calendar'?'active':''}">Календарь</a>
        <a href="#" data-view="advice" class="${state.view==='advice'?'active':''}">Советы</a>
        <a href="#" data-view="help" class="${state.view==='help'?'active':''}">Помощь</a>
        <a href="#" id="reset" style="margin-top:6px">Сбросить опрос</a>
        <div class="theme-toggle">
          <span style="font-weight:700">Тема</span>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <div id="switch" class="switch"><div class="knob"></div></div>
          </div>
        </div>
      </div>`;
    d.addEventListener('click', (e)=>{ if(e.target===d) openDrawer(false); });
    d.querySelectorAll('[data-view]').forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); openDrawer(false); go(a.getAttribute('data-view')); }));
    d.querySelector('#reset').onclick = () => { localStorage.removeItem(SKEY); localStorage.removeItem(DKEY); state.completed=false; state.answers={}; state.view='welcome'; render(); };
    const sw = d.querySelector('#switch');
    sw.onclick = () => { const cur = localStorage.getItem(THEME_KEY)||'dark'; applyTheme(cur==='light'?'dark':'light'); };
    return d;
  }

  function Onboarding(){
    const wrap = document.createElement('div'); wrap.className='container';
    const steps = getQuestions(); let idx = 0; const ans = state.answers||{};
    wrap.innerHTML = `
      <div class="card">
        <div class="progress"><i id="bar"></i></div>
        <div id="step" class="step"></div>
        <div class="row" style="padding:0 18px 16px 18px">
          <button id="back" class="btn ghost">Назад</button>
          <button id="next" class="btn primary">Далее</button>
        </div>
      </div>
      <p style="margin-top:8px;color:var(--muted);font-size:.8rem">Не является медицинской рекомендацией.</p>`;

    const elStep = $('#step', wrap), elBar=$('#bar', wrap), elBack=$('#back', wrap), elNext=$('#next', wrap);

    function setProgress(){ elBar.style.width = Math.round((idx/steps.length)*100) + '%'; }
    function ensureOtherInput(box, key, preset=''){ 
      let extra = box.querySelector('.other-wrap'); 
      if(!extra){ extra=document.createElement('div'); extra.className='other-wrap'; extra.innerHTML='<input class="input" id="otherInput" placeholder="Уточните...">'; box.appendChild(extra); }
      const inp = extra.querySelector('#otherInput'); inp.value = preset; inp.oninput = (e)=> ans[key+'_other']=e.target.value;
    }
    function removeOtherInput(box){ const w=box.querySelector('.other-wrap'); if(w) w.remove(); }

    function mount(){
      elBack.style.visibility = idx===0 ? 'hidden' : 'visible';
      setProgress();
      const s = steps[idx];
      elStep.innerHTML = `<h2>${s.title}</h2>`;

      if(s.type==='single'){ 
        const box=document.createElement('div'); box.className='options';
        (s.options||[]).forEach(opt=>{
          const row=document.createElement('label'); row.className='option'; row.innerHTML=`<input type="checkbox"><span>${opt}</span>`;
          const cb=row.querySelector('input');
          if(ans[s.key]) cb.checked = (ans[s.key]===opt);
          row.onclick = (e)=>{ e.preventDefault(); $$('.option input', box).forEach(x=>x.checked=false); cb.checked=true; ans[s.key]=opt;
            if(/другое/i.test(opt)) ensureOtherInput(box, s.key, ans[s.key+'_other']||''); else removeOtherInput(box);
            validate();
          };
          box.appendChild(row);
        });
        elStep.appendChild(box);
        if(typeof ans[s.key]==='string' && /другое/i.test(ans[s.key])) ensureOtherInput(box, s.key, ans[s.key+'_other']||'');
      }
      if(s.type==='multi'){ 
        const box=document.createElement('div'); box.className='options';
        (s.options||[]).forEach(opt=>{
          const row=document.createElement('label'); row.className='option'; row.innerHTML=`<input type="checkbox"><span>${opt}</span>`;
          const cb=row.querySelector('input');
          const prev=ans[s.key]||[]; if(prev.includes(opt)) cb.checked=true;
          row.onclick=(e)=>{ e.preventDefault(); cb.checked=!cb.checked; const vals=$$('.option input', box).filter(x=>x.checked).map(x=>x.nextElementSibling.textContent); ans[s.key]=vals;
            if(vals.some(v=>/другое/i.test(v))) ensureOtherInput(box, s.key, ans[s.key+'_other']||''); else removeOtherInput(box);
            validate();
          };
          box.appendChild(row);
        });
        elStep.appendChild(box);
        const prev=ans[s.key]||[]; if(prev.some(v=>/другое/i.test(v))) ensureOtherInput(box, s.key, ans[s.key+'_other']||'');
      }
      if(s.type==='number'){ 
        const def = Number(ans[s.key] ?? s.defaultValue ?? s.min); ans[s.key]=def;
        const row=document.createElement('div'); row.innerHTML=`<input id="rng" type="range" min="${s.min}" max="${s.max}" value="${def}" class="w-full"><div class="row" style="justify-content:flex-end"><div id="rngval" class="badge">${def}</div></div>`;
        elStep.appendChild(row);
        $('#rng',row).oninput=(e)=>{ ans[s.key]=Number(e.target.value); $('#rngval',row).textContent=String(ans[s.key]); validate(); };
      }
      if(s.type==='date'){ 
        const def = ans[s.key] || new Date().toISOString().slice(0,10); ans[s.key]=def;
        const row=document.createElement('div'); row.innerHTML=`<input id="dt" class="input" type="date" max="${new Date().toISOString().slice(0,10)}" value="${def}">`;
        elStep.appendChild(row);
        $('#dt',row).oninput=(e)=>{ ans[s.key]=e.target.value; validate(); };
      }
      validate();
    }
    function validate(){ 
      const s=steps[idx], v=ans[s.key]; let ok=true;
      if(s.type==='single') ok=!!v;
      if(s.type==='multi') ok=Array.isArray(v)&&v.length>0;
      if(s.type==='number') ok=typeof v==='number'&&!Number.isNaN(v);
      if(s.type==='date') ok=Boolean(v);
      elNext.disabled=!ok;
    }
    function next(){
      if(elNext.disabled) return;
      // lactation only if pregnancy === 'Да'
      if(steps[idx].key==='pregnancy' && ans['pregnancy']!=='Да'){ 
        // skip lactation step
        const lactIdx = steps.findIndex(s=>s.key==='lactation');
        if(lactIdx>idx) steps.splice(lactIdx,1);
      }
      if(idx<steps.length-1){ idx++; mount(); }
      else { state.completed=true; state.answers=ans; state.view='calendar'; save(SKEY,state); render(); }
    }
    function back(){ if(idx>0){ idx--; mount(); } }

    elNext.onclick = next; elBack.onclick = back;
    mount();
    return wrap;
  }

  function getQuestions(){
    return [
      { key:'goal', type:'single', title:'Зачем ты здесь?', options:['Отслеживать цикл','Планирование','Самочувствие','Другое'] },
      { key:'age', type:'number', title:'Сколько тебе лет?', min:7, max:60, defaultValue:24 },
      { key:'height', type:'number', title:'Рост (см)', min:120, max:210, defaultValue:170 },
      { key:'weight', type:'number', title:'Вес (кг)', min:30, max:160, defaultValue:60 },
      { key:'pregnancy', type:'single', title:'Беременность сейчас?', options:['Да','Нет','Планирую'] },
      { key:'lactation', type:'single', title:'Грудное вскармливание?', options:['Да','Нет'] },
      { key:'sex', type:'single', title:'Сексуальная активность', options:['Есть','Нет','Другое'] },
      { key:'contraception', type:'single', title:'Контрацепция', options:['Комбинированные ОК','Презервативы','ВМС','Презервативы','Прерванный акт','Нет','Другое'] },
      { key:'regular', type:'single', title:'Цикл регулярный?', options:['Да','Нет','Иногда'] },
      { key:'cycleLen', type:'number', title:'Средняя длина цикла (дн)', min:18, max:45, defaultValue:28 },
      { key:'periodLen', type:'number', title:'Длительность менструации (дн)', min:1, max:10, defaultValue:5 },
      { key:'pms', type:'multi', title:'Что ощущаешь в ПМС?', options:['Спазмы','Эмоциональные изменения','Усталость','Вздутие','Головная боль','Кожа','Другое'] },
      { key:'conditions', type:'multi', title:'Есть ли состояния, о которых важно знать?', options:['Эндометриоз','СПКЯ','Проблемы с щитовидной железой','Анемия','Другое'] },
      { key:'meds', type:'single', title:'Принимаешь лекарства сейчас?', options:['Да','Нет'] },
      { key:'allergy', type:'single', title:'Есть аллергии?', options:['Да','Нет'] },
      { key:'lastStart', type:'date', title:'Первый день последней менструации' }
    ];
  }

  function WelcomeView(){
    const w=document.createElement('div');
    w.innerHTML=`
      <div class="hero card">
        <img src="${FOX}" alt="Foxy">
        <h1>Привет! Я Foxy 🦊</h1>
        <p>Я помогу с отслеживанием цикла и самочувствия. Встроенный ИИ‑ассистент подскажет по здоровью — ментальному и физическому, на основе твоих ответов из опроса. Открывай меню в любой момент.</p>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="btn primary" id="toCalendar">Перейти к календарю</button>
          <button class="btn" id="toAdvice">Советы</button>
        </div>
      </div>`;
    $('#toCalendar',w).onclick=()=>go('calendar');
    $('#toAdvice',w).onclick=()=>go('advice');
    return w;
  }

  function CalendarView(){
    const a=state.answers; const model=predict({ lastStart:a.lastStart||new Date(), cycleLen:Number(a.cycleLen||28), periodLen:Number(a.periodLen||5) });
    const c=document.createElement('div');
    c.innerHTML=`
      <div class="card" style="padding:14px">
        <div class="row" style="margin-bottom:8px">
          <h3 style="margin:0;font-weight:800">${fmtPretty(new Date())}</h3>
          <div class="legend">
            <span><i style="background:rgba(239,68,68,.6);width:.8rem;height:.8rem;border-radius:4px;display:inline-block"></i> красные — менструация</span>
            <span><i style="background:rgba(34,197,94,.6);width:.8rem;height:.8rem;border-radius:4px;display:inline-block"></i> зелёные — фертильное окно</span>
          </div>
        </div>
        <div class="row" style="margin-bottom:8px;color:var(--muted)">
          Следующий старт: <b style="margin-left:6px;color:var(--ink)">${model.nextStart}</b>
        </div>
        <div class="grid-7" id="grid"></div>
        <div style="margin-top:10px;color:var(--muted);font-size:.9rem" id="tip"></div>
      </div>
      <div class="modal" id="modal">
        <div class="sheet card" style="padding:14px">
          <div class="row" style="margin-bottom:8px">
            <div id="mdate" style="font-weight:800"></div>
            <button id="mclose" class="btn">Закрыть</button>
          </div>
          <div style="margin-bottom:10px">Менструация</div>
          <div class="wrap-badges" id="flow">
            <div class="badge-choice" data-flow="0">Нет</div>
            <div class="badge-choice" data-flow="1">Умеренно</div>
            <div class="badge-choice" data-flow="2">Сильно</div>
          </div>
          <div style="margin:12px 0 8px 0">Симптомы</div>
          <div class="wrap-badges" id="sym">
            ${['Спазмы','Головная боль','Усталость','Эмоциональные изменения','Вздутие','Кожа'].map(s=>`<div class="badge-choice" data-s="${s}">${s}</div>`).join('')}
          </div>
          <div style="margin:12px 0 8px 0">Заметка</div>
          <textarea id="note" rows="4" class="input" placeholder="Как ты себя чувствуешь сегодня?"></textarea>
          <div class="row" style="margin-top:10px;justify-content:flex-end">
            <button id="msave" class="btn primary">Сохранить</button>
          </div>
        </div>
      </div>`;
    const grid = c.querySelector('#grid');
    const now = new Date(); const start=new Date(now.getFullYear(), now.getMonth(), 1);
    const startWeekday=(start.getDay()+6)%7; const first=new Date(start); first.setDate(first.getDate()-startWeekday);
    for(let i=0;i<42;i++){
      const d=new Date(first); d.setDate(first.getDate()+i); const key=fmtISO(d);
      const info=days[key]||{};
      const isPeriod = model.periodDays.includes(key) || (info.period && info.period.flow>0);
      const isFertile = key>=model.fertileStart && key<=model.fertileEnd;
      const el=document.createElement('button');
      el.className = `day ${isPeriod?'period':''} ${isFertile?'fertile':''}`.trim();
      el.textContent=String(d.getDate()); el.title=key;
      el.onclick=()=>openDay(key);
      grid.appendChild(el);
    }
    const tips=[
      'Во время фертильного окна может немного повышаться температура тела и либидо.',
      'Мягкая активность (йога/прогулки) помогает при ПМС.',
      'Вода и сон реально уменьшают выраженность симптомов.'
    ];
    c.querySelector('#tip').textContent = tips[(now.getDate()%tips.length)];
    // modal handlers
    const modal=c.querySelector('#modal'), mdate=c.querySelector('#mdate'), mclose=c.querySelector('#mclose');
    function openDay(key){
      modal.classList.add('show'); mdate.textContent = key;
      // init state
      const info = days[key]||{};
      // flow
      c.querySelectorAll('#flow .badge-choice').forEach(b=>{
        b.classList.toggle('active', String(info.period?.flow||0)===b.dataset.flow);
        b.onclick=()=>{ c.querySelectorAll('#flow .badge-choice').forEach(x=>x.classList.remove('active')); b.classList.add('active'); info.period={ flow:Number(b.dataset.flow) }; days[key]=info; save(DKEY, days); };
      });
      // symptoms
      c.querySelectorAll('#sym .badge-choice').forEach(b=>{
        const set = new Set(info.symptoms||[]);
        if(set.has(b.dataset.s)) b.classList.add('active');
        b.onclick=()=>{ if(set.has(b.dataset.s)) set.delete(b.dataset.s); else set.add(b.dataset.s); b.classList.toggle('active'); info.symptoms=Array.from(set); days[key]=info; save(DKEY, days); };
      });
      const note = c.querySelector('#note'); note.value = info.note||'';
      c.querySelector('#msave').onclick=()=>{ info.note = note.value; days[key]=info; save(DKEY, days); modal.classList.remove('show'); };
      mclose.onclick=()=>modal.classList.remove('show');
      modal.onclick=(e)=>{ if(e.target===modal) modal.classList.remove('show'); };
    }
    return c;
  }

  function AdviceView(){
    const v=document.createElement('div'); v.className='card'; v.style.padding='14px';
    v.innerHTML = `<h3 style="margin:0 0 8px 0;font-weight:800">Советы</h3>
    <ul style="margin:0;padding-left:18px;color:var(--muted)">
      <li>Поддерживай регулярный сон — это влияет на гормональный баланс.</li>
      <li>Лёгкая физическая активность помогает при ПМС и повышает настроение.</li>
      <li>Пей воду и будь бережной к себе в период менструации.</li>
    </ul>`;
    return v;
  }

  function HelpView(){
    const v=document.createElement('div'); v.className='card'; v.style.padding='14px';
    v.innerHTML = `<h3 style="margin:0 0 8px 0;font-weight:800">Помощь</h3>
    <p class="text-sm" style="color:var(--muted)">Это MVP. Данные не заменяют консультацию врача. При необычных симптомах обращайся к специалисту.</p>`;
    return v;
  }

  function AssistantView(){
    const v=document.createElement('div'); v.className='card'; v.style.padding='14px';
    v.innerHTML = `<h3 style="margin:0 0 8px 0;font-weight:800">ИИ ассистент</h3>
    <div class="chat" id="chat"></div>
    <div class="quick">
      <button class="btn" data-q="Советы при ПМС">ПМС советы</button>
      <button class="btn" data-q="Питание в разные фазы цикла">Питание</button>
      <button class="btn" data-q="Какие тренировки подходят сегодня?">Тренировки</button>
    </div>
    <div class="row" style="margin-top:8px">
      <input id="msg" class="input" placeholder="Спроси о чём угодно..." />
      <button id="send" class="btn primary">Отправить</button>
    </div>`;
    const chat = v.querySelector('#chat'); const input=v.querySelector('#msg');
    function push(type, text){ const m=document.createElement('div'); m.className='msg '+type; m.textContent=text; chat.appendChild(m); chat.scrollTop=chat.scrollHeight; }
    function demoAnswer(q){ 
      const a = 'Я сохраню твой вопрос и позже подключусь к базе и ИИ. Пока что могу дать общий совет: прислушивайся к телу, сон и вода помогают, а лёгкая активность часто снижает симптомы.';
      push('me', q); setTimeout(()=>push('ai', a), 250);
    }
    v.querySelectorAll('.quick .btn').forEach(b=> b.onclick=()=> demoAnswer(b.dataset.q));
    v.querySelector('#send').onclick=()=>{ const q=input.value.trim(); if(!q) return; input.value=''; demoAnswer(q); };
    return v;
  }
})();
