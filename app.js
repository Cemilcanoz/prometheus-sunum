(() => {
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const stage = $('#stage'), slides = $$('.slide'), mascot = $('#mascot'), bubble = $('#bubble'), frame = $('.frame');
let cur = 0, step = 0, timers = [];
const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
const sleep = ms => new Promise(r => later(r, ms));

/* konuşma metni: A ve B anlatıcı */
const NOTES = [
 ["(Siyah ekran. İlk basışta adlar gelir, ikinci basışta ateş yanıp söner. Konuşma yok; ateş sönünce bir kez daha bas.)", "—"],
 ["Merhaba, bugün Prometheus'u anlatacağız: sistemleri izlemek ve sorun çıktığında haber almak için kullanılan açık kaynak bir araç.", "Önce ne işe yaradığını ve nasıl çalıştığını, sonra da resmî başlangıç kılavuzundaki uygulamayı adım adım göstereceğiz."],
 ["Bir sistem yavaşladığında sebebini tahmin etmek yerine ölçmek gerekir. Metrik sayısal bir ölçümdür; zaman serisi de o ölçümün zaman içindeki kaydıdır.", "Örneğin web sunucusunda istek süresi, veritabanında aktif bağlantı sayısı ölçülür. İstek sayısı çok yüksekken uygulama yavaşsa sunucu eklemek çözüm olabilir."],
 ["Prometheus bir izleme ve uyarı araç setidir. 2012'de SoundCloud'da başladı, 2016'da Kubernetes'ten sonra ikinci proje olarak CNCF'e katıldı.", "Bugün tek bir şirkete bağlı değil. Go ile yazılmış, Apache 2.0 lisanslı."],
 ["Prometheus'ta her veri bir zaman serisidir. Seriyi metrik adı ve etiketler tanımlar.", "Etiketler anahtar-değer çiftleridir; aynı metriği iş, makine ve mod gibi boyutlara ayırır. Her örnek bir zaman damgası ve bir sayı taşır."],
 ["Prometheus veriyi beklemez, kendisi gidip alır. Hedeflerin /metrics adresini HTTP ile belirli aralıklarla okur. Buna çekme modeli denir.", "Çok kısa süren işler için Pushgateway vardır. Hedefler servis keşfiyle bulunur ya da elle yazılır."],
 ["Mimaride solda metrik kaynakları var: uygulamalar ve exporter'lar. Ortadaki sunucu bunları toplar, yerel diske yazar ve kuralları çalıştırır.", "Bir uyarı koşulu gerçekleşirse Alertmanager'a iletilir. Veriyi görmek için web arayüzü veya Grafana, PromQL ile sunucuya sorar."],
 ["Dört metrik tipi var. Counter yalnızca artar: istek sayısı gibi. Gauge artıp azalabilir: bellek kullanımı gibi.", "Histogram gözlemleri kovalara sayar. Summary ise yüzdelikleri istemci tarafında hesaplar."],
 ["Uygulamaya geçelim. Arşivi açıp klasöre giriyoruz ve Prometheus'u yapılandırma dosyasını göstererek başlatıyoruz.", "Sunucu hazır olunca localhost:9090 adresinde arayüz açılır. /metrics adresinde Prometheus'un kendi metrikleri görünür. İstersek Docker ile de tek komutla çalışır."],
 ["Bu, kılavuzdaki ilk yapılandırma. global bölümü hedeflerin varsayılan olarak 15 saniyede bir okunacağını söyler.", "scrape_configs altında prometheus adında bir iş var; hedefi localhost:9090, yani Prometheus kendini izliyor."],
 ["Sorgu arayüzünde bir metrik adı yazınca o metriğin bütün serileri gelir. Süslü parantezle etikete göre süzebiliriz.", "count ile serileri sayarız. Graph sekmesinde rate fonksiyonu bir sayacın saniyedeki artış hızını çizer."],
 ["Gerçek bir hedef için Node Exporter'ı üç ayrı portta başlatıyoruz. Yapılandırmaya node işini ekleyip ikisini production, birini canary olarak etiketliyoruz.", "Targets sayfasında üçü de UP görünmeli. Artık node_cpu_seconds_total gibi makine metriklerini etiketleriyle sorgulayabiliriz."],
 ["Çok seriyi her seferinde toplamak yavaş olabilir. Recording rule ifadeyi düzenli çalıştırıp sonucu yeni bir seri olarak kaydeder.", "Kural dosyasını prometheus.yml'e ekliyoruz. Yapılandırmayı süreci kapatmadan SIGHUP ile yeniden yükleyebiliriz."],
 ["Prometheus sayısal zaman serilerinde, mikroservislerde ve dinamik ortamlarda güçlüdür. Her sunucu bağımsız çalıştığı için kesinti anında bile kullanılabilir.", "Ama yüzde yüz doğruluk gereken işlerde, örneğin istek başına faturalamada uygun değildir."],
 ["Özetle: Prometheus hedeflerden metrikleri çeker, etiketli zaman serisi olarak saklar, PromQL ile sorgulanır.", "Koşul gerçekleşince Alertmanager üzerinden haber verir. Dinlediğiniz için teşekkürler, sorularınızı alabiliriz."],
 ["(Ateş kendiliğinden söner, ekran siyah kalır. Konuşma yok.)", "—"]
];

/* ölçek */
function fit() { const s = Math.min(innerWidth / 1600, innerHeight / 900); stage.style.transform = `translate(${-800 * s}px,${-450 * s}px) scale(${s})`; }
addEventListener('resize', fit); fit();

/* ışınlar */
$$('.rays').forEach(svg => {
  const cx = +svg.dataset.cx, cy = +svg.dataset.cy; svg.setAttribute('viewBox', '0 0 1600 900');
  let h = `<g style="transform-origin:${cx}px ${cy}px">`;
  for (let i = 0; i < 72; i++) { const a = i * Math.PI / 36, r1 = i % 2 ? 330 : 290, r2 = 1500; h += `<line x1="${cx + Math.cos(a) * r1}" y1="${cy + Math.sin(a) * r1}" x2="${cx + Math.cos(a) * r2}" y2="${cy + Math.sin(a) * r2}"/>`; }
  svg.innerHTML = h + `</g><circle cx="${cx}" cy="${cy}" r="270"/><circle cx="${cx}" cy="${cy}" r="282"/>`;
});

/* maskot */
function moveMascot(s) {
  const [x, y, sc, pose, flip, bp] = s.dataset.m.split(',');
  if (pose === 'hide') { mascot.style.opacity = 0; mascot.dataset.hidden = 1; bubble.classList.remove('show'); return; }
  if (mascot.dataset.hidden !== '0') { mascot.style.transition = 'none'; mascot.style.transform = `translate(${x - 150}px,${y - 420}px) scale(${sc})`; void mascot.offsetWidth; mascot.style.transition = ''; mascot.dataset.x = x; mascot.dataset.y = y; mascot.dataset.hidden = 0; }
  mascot.style.opacity = 1;
  const moved = mascot.dataset.x !== x || mascot.dataset.y !== y;
  mascot.dataset.x = x; mascot.dataset.y = y;
  mascot.style.transform = `translate(${x - 150}px,${y - 420}px) scale(${sc})`;
  const base = (flip === '1' ? 'flip ' : '') + (s.classList.contains('t-fire') && !$('.rays.sun', s) ? 'on-fire ' : '') + (s.classList.contains('t-ink') ? 'on-ink ' : '');
  mascot.className = base + (moved ? 'walking' : 'pose-' + pose);
  if (moved) later(() => { mascot.className = base + 'pose-' + pose; }, 1150);
  bubble.classList.remove('show');
  later(() => say(s, +x, +y, +sc, bp), moved ? 1100 : 150);
}
function say(s, x, y, sc, bp) {
  let t = ''; for (let k = step; k >= 0 && !t; k--) t = s.dataset['say' + (k || '')] || '';
  if (!t) return;
  bubble.textContent = t; bubble.className = 'b-' + bp;
  const w = bubble.offsetWidth, h = bubble.offsetHeight;
  let L, T;
  if (bp === 't') { L = x - w / 2; T = y - 420 * sc - h - 16; }
  else if (bp === 'r') { L = x + 118 * sc; T = y - 330 * sc; }
  else { L = x - 118 * sc - w; T = y - 330 * sc; }
  bubble.style.transform = `translate(${Math.round(L)}px,${Math.round(T)}px)`;
  bubble.classList.add('show');
}

/* terminal */
async function playTerm(term) {
  if (term._busy) return; term._busy = true; const run = term._run = (term._run || 0) + 1;
  for (;;) {
    const l = $$('.l', term).find(e => !e._done && (!e.dataset.step || +e.dataset.step <= step));
    if (!l || term._run !== run) break;
    l._done = true; l.classList.add('show');
    if (l.classList.contains('cmd')) {
      const txt = l._t ?? (l._t = l.textContent); l.textContent = ''; l.classList.add('typing');
      for (const ch of txt) { if (term._run !== run) return; l.textContent += ch; await sleep(16); }
      l.classList.remove('typing'); await sleep(260);
    } else await sleep(170);
  }
  term._busy = false;
}
function resetTerms(s) { $$('.term', s).forEach(t => { t._run = (t._run || 0) + 1; t._busy = false; $$('.l', t).forEach(l => { l._done = false; l.classList.remove('show', 'typing'); if (l._t != null) l.textContent = l._t; }); }); }

/* PromQL arayüzü */
const M = 'prometheus_target_interval_length_seconds';
const lab = q => `{instance="localhost:9090", interval="5s", job="prometheus", quantile="${q}"}`;
const QS = [
  { q: M, rows: [['0.01', '4.999610'], ['0.05', '4.999742'], ['0.5', '5.000018'], ['0.9', '5.000201'], ['0.99', '5.000387']].map(([a, v]) => [M + lab(a), v]) },
  { q: M + '{quantile="0.99"}', rows: [[M + lab('0.99'), '5.000387']] },
  { q: `count(${M})`, rows: [['{}', '5']] },
  { q: 'rate(prometheus_tsdb_head_chunks_created_total[1m])', graph: true }
];
let uiRun = 0, graphT;
async function playQuery(k) {
  const run = ++uiRun, q = $('#q'), res = $('#res'), d = QS[k]; clearInterval(graphT);
  res.innerHTML = ''; q.textContent = ''; q.classList.add('typing');
  $('#tabT').classList.toggle('on', !d.graph); $('#tabG').classList.toggle('on', !!d.graph);
  for (const ch of d.q) { if (run !== uiRun) return; q.textContent += ch; await sleep(14); }
  q.classList.remove('typing'); const b = $('.ui-q button'); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
  await sleep(350); if (run !== uiRun) return;
  if (!d.graph) { res.innerHTML = d.rows.map((r, i) => `<div class="r" style="animation-delay:${i * 90}ms"><span>${r[0].replace(/quantile="[^"]+"/, m => `<b>${m}</b>`)}</span><b>${r[1]}</b></div>`).join(''); return; }
  res.innerHTML = `<svg viewBox="0 0 1090 300" preserveAspectRatio="none"><path class="gl" d="M40 40H1080M40 110H1080M40 180H1080M40 250H1080"/><text x="4" y="44">0.6</text><text x="4" y="114">0.4</text><text x="4" y="184">0.2</text><text x="4" y="254">0</text><polyline points=""/></svg>`;
  const pl = $('polyline', res), pts = []; let v = .25;
  const tick = () => { v = Math.max(.05, Math.min(.58, v + (Math.random() - .5) * .16)); pts.push(v); if (pts.length > 54) pts.shift(); pl.setAttribute('points', pts.map((p, i) => `${40 + i * 19.6},${250 - p * 350}`).join(' ')); };
  for (let i = 0; i < 30; i++) tick(); graphT = setInterval(tick, 420);
}

/* örnek akışı */
let sampT;
function samples(on) {
  clearInterval(sampT); const row = $('#sampleRow'); if (!on) { row.innerHTML = ''; return; }
  let t = Math.floor(Date.now() / 1000), v = 48211.37;
  const add = () => { const e = document.createElement('span'); e.textContent = `@${t}  ${v.toFixed(2)}`; row.prepend(e); if (row.children.length > 7) row.lastChild.remove(); t += 15; v += 14.2 + Math.random(); };
  add(); sampT = setInterval(add, 1300);
}

/* gösterim */
function maxStep(s) { return Math.max(0, ...$$('[data-step]', s).map(e => +e.dataset.step), ...Object.keys(s.dataset).filter(k => /^say\d/.test(k)).map(k => +k.slice(3))); }
function render(enter) {
  const s = slides[cur];
  slides.forEach((e, i) => e.classList.toggle('active', i === cur));
  $$('[data-step]', s).forEach(e => e.classList.toggle('on', +e.dataset.step <= step));
  $$('[data-hl]', s).forEach(e => e.classList.toggle('hl', +e.dataset.hl === step));
  s.dataset.at = step;
  const black = s.classList.contains('t-black'), n14 = slides.length - 2;
  const th = s.classList.contains('t-fire') ? 'fire' : s.classList.contains('t-paper') ? 'paper' : 'ink';
  frame.className = 'frame bg-' + th + (th === 'paper' ? '' : ' light') + (black ? ' off' : '');
  $('#fTR').textContent = `Fig. ${String(cur).padStart(2, '0')} / ${n14}`; $('#fBL').textContent = s.dataset.label;
  $('#count').textContent = (black ? s.dataset.label : `${cur} / ${n14}`) + (maxStep(s) ? ` · adım ${step}/${maxStep(s)}` : '');
  moveMascot(s);
  $$('.term', s).forEach((t, i) => later(() => playTerm(t), enter ? 500 + i * 900 : 0));
  if ($('#q', s)) later(() => playQuery(step), enter ? 500 : 0);
  if ($('#sampleRow', s)) samples(step >= 3); else samples(false);
  const n = $('#notes'); if (!n.hidden) n.innerHTML = `<b>CEMİL</b>${NOTES[cur][0]}<b>MESUT</b>${NOTES[cur][1]}`;
  try { history.replaceState(null, '', '#' + cur); } catch (e) {}
}
function go(i, st = 0) {
  if (i < 0 || i >= slides.length) return;
  timers.forEach(clearTimeout); timers = []; uiRun++; clearInterval(graphT);
  if (i !== cur) resetTerms(slides[cur]);
  const enter = i !== cur || st === 0 && step !== 0; cur = i; step = st;
  if (enter) resetTerms(slides[cur]);
  render(enter);
}
const next = () => step < maxStep(slides[cur]) ? (step++, render(false)) : go(cur + 1);
const prev = () => step > 0 ? go(cur, step - 1 > 0 ? step - 1 : 0) : go(cur - 1, cur > 0 ? maxStep(slides[cur - 1]) : 0);

/* düzenlenebilir adlar */
$$('.edit').forEach(e => { try { const v = localStorage.getItem('prom-' + e.dataset.key); if (v) e.textContent = v; } catch (x) {} e.addEventListener('input', () => { try { localStorage.setItem('prom-' + e.dataset.key, e.textContent); } catch (x) {} }); });

addEventListener('keydown', e => {
  if (e.target.isContentEditable) { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.target.blur(); } return; }
  const k = e.key.toLowerCase();
  if (['arrowright', ' ', 'pagedown', 'enter'].includes(k)) { e.preventDefault(); next(); }
  else if (['arrowleft', 'pageup', 'backspace'].includes(k)) { e.preventDefault(); prev(); }
  else if (k === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  else if (k === 'h') document.body.classList.toggle('nohud');
  else if (k === 'm') document.body.classList.toggle('still');
  else if (k === 'r') { step = 1; go(cur, 0); }
  else if (k === 'n') { $('#notes').hidden = !$('#notes').hidden; render(false); }
  else if (k === 'home') go(0); else if (k === 'end') go(slides.length - 1);
});
$('#next').onclick = next; $('#prev').onclick = prev;
cur = Math.min(slides.length - 1, Math.max(0, parseInt(location.hash.slice(1)) || 0));
window.__deck = { go, next, prev, get state() { return { cur, step }; } };
render(true);
})();
