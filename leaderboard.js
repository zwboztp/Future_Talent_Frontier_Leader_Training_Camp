import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

const supabase = createClient('https://vzspkzksncononmhuiau.supabase.co', 'sb_publishable_YhliMvVH0LKwZJ2iOinfvw_IBcW0LJN');
const $ = (selector) => document.querySelector(selector);
const leaderboardMarkup = `
  <section class="view" id="leaderboard">
    <div class="title-row"><div><h2>리더보드</h2><p>가장 높은 점수가 1위입니다.</p></div><button class="back" data-leaderboard-back>← 돌아가기</button></div>
    <div class="leaderboard-card"><h3>최고 기록</h3><p id="leaderboardHint">게임 오버 후 기록을 등록할 수 있습니다.</p><form class="score-entry" id="leaderboardForm" hidden><input id="leaderboardName" maxlength="20" placeholder="이름 (최대 20글자)" autocomplete="nickname"><button type="submit">등록</button></form><div id="leaderboardStatus" class="leaderboard-status">불러오는 중…</div><ol id="leaderboardList" class="rank-list"></ol></div>
  </section>`;
const styles = `.leaderboard-card{width:min(100%,580px);margin:auto;padding:22px;background:var(--panel);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow)}.leaderboard-card h3{margin:0 0 6px;font-size:22px}.leaderboard-card p{color:var(--muted);margin:0 0 17px;font-size:13px}.score-entry{display:flex;gap:8px;margin-bottom:20px}.score-entry input{min-width:0;flex:1;padding:12px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink)}.score-entry button{padding:0 15px;border-radius:10px;color:#fff;background:var(--accent);font-weight:800}.rank-list{margin:0;padding:0;list-style:none}.rank-list li{display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;padding:12px 6px;border-top:1px solid var(--line);font-weight:700}.rank-list li:nth-child(-n+3) .rank-number{color:var(--accent)}.rank-score{font-variant-numeric:tabular-nums}.leaderboard-status{color:var(--muted);padding:20px;text-align:center}`;
document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);
document.querySelector('main').insertAdjacentHTML('beforeend', leaderboardMarkup);
const homeMenu = document.querySelector('#home .menu');
const button = document.createElement('button');
button.className = 'secondary'; button.textContent = '🏆 리더보드';
homeMenu.insertBefore(button, homeMenu.children[1]);

const list = $('#leaderboardList'), status = $('#leaderboardStatus'), form = $('#leaderboardForm'), nameInput = $('#leaderboardName'), hint = $('#leaderboardHint');
const scoreText = () => Number($('#score')?.textContent.replace(/,/g, '') || 0);
function showStatus(text) { status.textContent = text; status.hidden = false; }
function draw(entries) { list.innerHTML = ''; if (!entries.length) { showStatus('아직 등록된 점수가 없습니다. 첫 기록의 주인공이 되어 보세요!'); return; } status.hidden = true; entries.forEach((entry, index) => { const li = document.createElement('li'); li.innerHTML = `<span class="rank-number">${index + 1}</span><span>${entry.player_name}</span><span class="rank-score">${Number(entry.score).toLocaleString()}</span>`; list.append(li); }); }
async function loadLeaderboard() { showStatus('불러오는 중…'); const { data, error } = await supabase.from('leaderboard_entries').select('player_name, score, created_at').order('score', { ascending: false }).order('created_at', { ascending: true }).limit(20); if (error) { showStatus('리더보드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'); return; } draw(data ?? []); }
function prepareEntry() { const score = Number(sessionStorage.getItem('bbLastScore') || 0), submitted = sessionStorage.getItem('bbLeaderboardSubmittedScore'); if (score > 0 && submitted !== String(score)) { form.hidden = false; hint.textContent = `이번 게임 점수 ${score.toLocaleString()}점을 기록에 등록할 수 있습니다.`; } else { form.hidden = true; hint.textContent = '게임 오버 후 기록을 등록할 수 있습니다.'; } }
function openLeaderboard() { document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === 'leaderboard')); prepareEntry(); loadLeaderboard(); }
button.addEventListener('click', openLeaderboard);
document.querySelector('[data-leaderboard-back]').addEventListener('click', () => { document.querySelectorAll('.view').forEach((view) => view.classList.toggle('active', view.id === 'home')); });
form.addEventListener('submit', async (event) => { event.preventDefault(); const score = Number(sessionStorage.getItem('bbLastScore') || 0), name = nameInput.value.trim(); if (!name || Array.from(name).length > 20) { showStatus('이름은 1~20글자로 입력해 주세요.'); return; } showStatus('기록을 등록하는 중…'); const { data, error } = await supabase.functions.invoke('submit-leaderboard-score', { body: { name, score } }); if (error || data?.error) { showStatus(data?.error || '기록을 등록하지 못했습니다.'); return; } sessionStorage.setItem('bbLeaderboardSubmittedScore', String(score)); form.hidden = true; hint.textContent = '기록이 등록되었습니다!'; await loadLeaderboard(); });
new MutationObserver(() => { if ($('#modal')?.classList.contains('show') && $('#modalTitle')?.textContent === '게임 오버') { const score = scoreText(); if (score > 0) sessionStorage.setItem('bbLastScore', String(score)); } }).observe($('#modal'), { attributes: true, attributeFilter: ['class'] });
