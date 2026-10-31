/**
 * WORKOUT LIST & SPACEBAR LOGGER MODULE
 * Terhubung secara modular ke assets/app.js melalui window.overlayRenderHooks
 */

let exercises = [
    { name: 'PUSH UPS', target: 10 },
    { name: 'PULL UPS', target: 10 },
    { name: 'SQUATS',   target: 10 },
    { name: '',         target: 10 }
];
let activeExerciseIdx = 0;

let repEvents = [];
let roundTimestamps = [];
let nextEventId = 1;
let lastSpacePressTime = 0;

let listPos = { x: 360, y: 620 };
let isDraggingList = false;
let listDragOffset = { x: 0, y: 0 };
let repPopScale = 1.0;

// History Stack untuk Undo & Redo
let workoutUndoStack = [];
let workoutRedoStack = [];
const MAX_WORKOUT_HISTORY = 100;

if (typeof modalTitles !== 'undefined') {
    modalTitles.workout = 'Workout List & Logger';
}

function hexToRgbaWorkout(hex, alpha = 1) {
    hex = (hex || '#09090b').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 9;
    const g = parseInt(hex.substring(2, 4), 16) || 9;
    const b = parseInt(hex.substring(4, 6), 16) || 11;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function cloneWorkoutSnapshot() {
    return JSON.parse(JSON.stringify({
        exercises,
        activeExerciseIdx,
        repEvents,
        roundTimestamps,
        listPos
    }));
}

function recordWorkoutHistory() {
    workoutUndoStack.push(cloneWorkoutSnapshot());
    if (workoutUndoStack.length > MAX_WORKOUT_HISTORY) workoutUndoStack.shift();
    workoutRedoStack = [];
    updateWorkoutHistoryButtons();
}

function applyWorkoutSnapshot(snap) {
    exercises         = snap.exercises;
    activeExerciseIdx = snap.activeExerciseIdx;
    repEvents         = snap.repEvents;
    roundTimestamps   = snap.roundTimestamps;
    listPos           = snap.listPos || { x: 360, y: 620 };
    renderExerciseInputs();
    renderEventLog();
    renderFrame();
}

function undoWorkoutAction() {
    if (workoutUndoStack.length === 0) return;
    const prev = workoutUndoStack.pop();
    workoutRedoStack.push(cloneWorkoutSnapshot());
    applyWorkoutSnapshot(prev);
    updateWorkoutHistoryButtons();
}

function redoWorkoutAction() {
    if (workoutRedoStack.length === 0) return;
    const next = workoutRedoStack.pop();
    workoutUndoStack.push(cloneWorkoutSnapshot());
    applyWorkoutSnapshot(next);
    updateWorkoutHistoryButtons();
}

function updateWorkoutHistoryButtons() {
    const btnU = document.getElementById('btnWorkoutUndo');
    const btnR = document.getElementById('btnWorkoutRedo');
    if (btnU) btnU.disabled = (workoutUndoStack.length === 0);
    if (btnR) btnR.disabled = (workoutRedoStack.length === 0);
}

function resetWorkoutListPosition() {
    const ratio = document.getElementById('aspectRatioSelect')?.value || '9:16';
    if (ratio === '9:16') listPos = { x: 360, y: 620 };
    else if (ratio === '1:1') listPos = { x: 540, y: 500 };
    else listPos = { x: 1020, y: 240 };
    renderFrame();
}

function getCountsAtTime(workoutSec) {
    const perEx = [0, 0, 0, 0];
    let totalReps = 0;
    for (let i = 0; i < repEvents.length; i++) {
        if (workoutSec >= repEvents[i].time) {
            const idx = repEvents[i].exIdx;
            if (perEx[idx] !== undefined) perEx[idx]++;
            totalReps++;
        } else break;
    }
    let currentRound = 1;
    for (let i = 0; i < roundTimestamps.length; i++) {
        if (workoutSec >= roundTimestamps[i]) currentRound++;
        else break;
    }
    return { perEx, totalReps, currentRound };
}

function setActiveExercise(idx) {
    activeExerciseIdx = idx;
    const badge = document.getElementById('lblActiveExBadge');
    if (badge) {
        const name = exercises[idx]?.name || `Slot ${idx + 1}`;
        badge.innerText = `Active: [${idx + 1}] ${name}`;
    }
    renderExerciseInputs();
    renderFrame();
}

// Tambah +1 Repetisi saat tombol Spasi ditekan
function markRepNow(forcedExIdx = null) {
    const nowMs = performance.now();
    const debounceLimit = parseInt(document.getElementById('debounceMsSelect')?.value || 0, 10);
    if (forcedExIdx === null && debounceLimit > 0 && (nowMs - lastSpacePressTime) < debounceLimit) {
        return;
    }
    lastSpacePressTime = nowMs;

    const workoutSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    const spaceMode = document.getElementById('spacebarMode')?.value || 'manual_select';
    let targetExIdx = (forcedExIdx !== null) ? forcedExIdx : activeExerciseIdx;

    if (forcedExIdx === null && spaceMode === 'auto_cycle') {
        const counts = getCountsAtTime(workoutSec);
        const validExercises = exercises.map((e, i) => ({ ...e, idx: i })).filter(e => e.name.trim() !== '');
        if (validExercises.length > 0) {
            const totalPerRound = validExercises.reduce((acc, e) => acc + Math.max(1, e.target), 0);
            const posInRound = counts.totalReps % totalPerRound;
            let accTarget = 0;
            for (const ve of validExercises) {
                accTarget += Math.max(1, ve.target);
                if (posInRound < accTarget) {
                    targetExIdx = ve.idx;
                    activeExerciseIdx = ve.idx;
                    break;
                }
            }
        }
    }

    recordWorkoutHistory();

    let newStamp = Number(workoutSec.toFixed(2));
    while (repEvents.some(ev => ev.time === newStamp)) {
        newStamp = Number((newStamp + 0.01).toFixed(2));
    }

    repEvents.push({ id: nextEventId++, time: newStamp, exIdx: targetExIdx });
    repEvents.sort((a, b) => a.time - b.time);

    if (forcedExIdx === null && spaceMode === 'auto_cycle') {
        const validExercises = exercises.filter(e => e.name.trim() !== '');
        const totalPerRound = validExercises.reduce((acc, e) => acc + Math.max(1, e.target), 0);
        if (totalPerRound > 0 && (repEvents.length % totalPerRound === 0)) {
            roundTimestamps.push(Number((newStamp + 0.01).toFixed(2)));
        }
    }

    currentVideoSec = Math.max(currentVideoSec, trimStartTotalSec + newStamp);
    repPopScale = 1.28;
    setActiveExercise(activeExerciseIdx);
    renderEventLog();
    renderFrame();
}

// Kurangi -1 Repetisi pada gerakan tertentu
function decrementSpecificExercise(exIdx) {
    const workoutSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    let targetIndexInArr = -1;
    for (let i = repEvents.length - 1; i >= 0; i--) {
        if (repEvents[i].exIdx === exIdx && repEvents[i].time <= workoutSec + 0.5) {
            targetIndexInArr = i;
            break;
        }
    }
    if (targetIndexInArr === -1) {
        for (let i = repEvents.length - 1; i >= 0; i--) {
            if (repEvents[i].exIdx === exIdx) {
                targetIndexInArr = i;
                break;
            }
        }
    }
    if (targetIndexInArr !== -1) {
        recordWorkoutHistory();
        repEvents.splice(targetIndexInArr, 1);
        renderExerciseInputs();
        renderEventLog();
        renderFrame();
    }
}

function markRoundNow() {
    recordWorkoutHistory();
    const workoutSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    roundTimestamps.push(Number(workoutSec.toFixed(2)));
    roundTimestamps.sort((a, b) => a - b);
    repPopScale = 1.28;
    renderEventLog();
    renderFrame();
}

function deleteRepEventById(evId) {
    const idx = repEvents.findIndex(e => e.id === evId);
    if (idx !== -1) {
        recordWorkoutHistory();
        repEvents.splice(idx, 1);
        renderExerciseInputs();
        renderEventLog();
        renderFrame();
    }
}

function changeRepEventExercise(evId, newExIdx) {
    const ev = repEvents.find(e => e.id === evId);
    if (ev) {
        recordWorkoutHistory();
        ev.exIdx = parseInt(newExIdx, 10);
        renderExerciseInputs();
        renderEventLog();
        renderFrame();
    }
}

function clearAllReps() {
    if (repEvents.length === 0 && roundTimestamps.length === 0) return;
    recordWorkoutHistory();
    repEvents = [];
    roundTimestamps = [];
    renderExerciseInputs();
    renderEventLog();
    renderFrame();
}

function generateDemoMultiReps() {
    recordWorkoutHistory();
    repEvents = [];
    roundTimestamps = [];
    const duration = Math.max(60, trimEndTotalSec - trimStartTotalSec);
    const validExercises = exercises.map((e, i) => ({ ...e, idx: i })).filter(e => e.name.trim() !== '');
    if (validExercises.length === 0) return;

    let t = 3.0;
    while (t < duration - 2) {
        for (const ve of validExercises) {
            for (let r = 0; r < ve.target; r++) {
                if (t >= duration - 2) break;
                repEvents.push({ id: nextEventId++, time: Number(t.toFixed(1)), exIdx: ve.idx });
                t += 2.2;
            }
        }
        if (t < duration - 2) {
            roundTimestamps.push(Number(t.toFixed(1)));
            t += 4.0;
        }
    }
    renderExerciseInputs();
    renderEventLog();
    renderFrame();
}

function jumpToWorkoutTime(sec) {
    currentVideoSec = sec;
    const slider = document.getElementById('timelineSlider');
    if (slider) slider.value = sec;
    if (useVideoBg) hiddenVideo.currentTime = sec;
    renderExerciseInputs();
    renderFrame();
}

function renderExerciseInputs() {
    const container = document.getElementById('exerciseRowsContainer');
    if (!container) return;
    container.innerHTML = '';

    const workoutSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    const counts = getCountsAtTime(workoutSec);

    exercises.forEach((ex, idx) => {
        const isActive = (idx === activeExerciseIdx);
        const curVal = counts.perEx[idx] || 0;
        const row = document.createElement('div');
        row.className = `flex items-center gap-1.5 p-1.5 rounded-md border transition ${isActive ? 'bg-[#18181c] border-orange-500/70' : 'bg-[#0e0e11] border-[#232329]'}`;
        row.innerHTML = `
            <button type="button" onclick="setActiveExercise(${idx})" class="w-7 h-7 rounded text-[11px] font-mono-tech font-semibold transition ${isActive ? 'bg-orange-500 text-zinc-950' : 'bg-[#18181c] text-zinc-400 hover:text-zinc-200'}" title="Select with key ${idx + 1}">
                ${idx + 1}
            </button>
            <input type="text" value="${ex.name}" placeholder="Empty Slot" oninput="exercises[${idx}].name=this.value; renderFrame();" class="input-tech flex-1 min-w-0 rounded px-2 py-1 text-xs font-medium uppercase">
            <div class="flex items-center bg-[#09090b] border border-[#232329] rounded p-0.5">
                <button type="button" onclick="decrementSpecificExercise(${idx})" class="w-5 h-5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-mono-tech flex items-center justify-center" title="Subtract 1 rep">-</button>
                <span class="text-[11px] font-mono-tech font-semibold text-zinc-200 w-7 text-center">${curVal}</span>
                <button type="button" onclick="markRepNow(${idx})" class="w-5 h-5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-mono-tech flex items-center justify-center" title="Add 1 rep">+</button>
            </div>
            <input type="number" value="${ex.target}" min="1" oninput="exercises[${idx}].target=parseInt(this.value||1,10); renderFrame();" class="input-tech w-11 rounded px-1.5 py-1 text-xs font-mono-tech text-zinc-400 text-center" title="Target Reps">
        `;
        container.appendChild(row);
    });
}

function renderEventLog() {
    const logContainer = document.getElementById('eventLogList');
    if (!logContainer) return;

    if (repEvents.length === 0) {
        logContainer.innerHTML = `<div class="text-zinc-600 text-center py-3 text-[11px] font-sans">No events logged. Press [Space] during playback.</div>`;
        return;
    }

    const reversed = [...repEvents].reverse().slice(0, 40);
    logContainer.innerHTML = reversed.map((ev, i) => {
        const repNum = String(repEvents.length - i).padStart(2, '0');
        const vidTime = trimStartTotalSec + ev.time;
        const opts = exercises.map((ex, idx) => ex.name.trim() ? `<option value="${idx}" ${idx === ev.exIdx ? 'selected' : ''} class="bg-zinc-900">${ex.name}</option>` : '').join('');
        return `
            <div class="flex items-center justify-between bg-[#141418] px-2 py-1 rounded border border-[#232329]">
                <div class="flex items-center gap-2">
                    <span class="text-zinc-600">#${repNum}</span>
                    <button type="button" onclick="jumpToWorkoutTime(${vidTime})" class="text-zinc-300 hover:text-orange-400 transition">
                        ${formatMMSS(ev.time)}
                    </button>
                </div>
                <div class="flex items-center gap-1.5">
                    <select onchange="changeRepEventExercise(${ev.id}, this.value)" class="bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5 text-[10px] text-zinc-300 focus:outline-none">
                        ${opts}
                    </select>
                    <button type="button" onclick="deleteRepEventById(${ev.id})" class="text-zinc-500 hover:text-red-400 px-1 transition" title="Remove event">
                        ×
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render Daftar Workout & 10 Style Container di Kanvas
function renderWorkoutOverlay(ctx) {
    const showCheckbox = document.getElementById('showWorkoutList');
    if (!showCheckbox || !showCheckbox.checked) return;

    const boxStyle    = document.getElementById('listBoxStyleSelect')?.value || 'glass_card';
    const fontFam     = document.getElementById('listFontSelect')?.value || "'Montserrat', sans-serif";
    const align       = document.getElementById('listAlignSelect')?.value || 'center';
    const wodHeader   = (document.getElementById('wodHeader')?.value || '').trim().toUpperCase();
    const listFormat  = document.getElementById('listDisplayFormat')?.value || 'target_first_live';

    const headerColor = document.getElementById('listHeaderColor')?.value || '#f59e0b';
    const activeColor = document.getElementById('listActiveColor')?.value || '#10b981';
    const textColor   = document.getElementById('listTextColor')?.value || '#ffffff';
    const bgHex       = document.getElementById('listBgColor')?.value || '#09090b';
    const bgOpacity   = parseFloat(document.getElementById('listBgOpacity')?.value ?? 0.70);
    const listScale   = parseFloat(document.getElementById('listScaleSlider')?.value || 1.0);

    const workoutElapsedSec = Math.max(0, currentVideoSec - trimStartTotalSec);
    const counts = getCountsAtTime(workoutElapsedSec);

    if (repPopScale > 1.0) {
        repPopScale = Math.max(1.0, repPopScale - 0.04);
    }

    const lines = [];
    exercises.forEach((ex, idx) => {
        if (!ex.name || ex.name.trim() === '') return;
        const nameUpper = ex.name.trim().toUpperCase();
        const curVal    = counts.perEx[idx] || 0;
        const isAct     = (idx === activeExerciseIdx);

        let text = '';
        if (listFormat === 'target_first_live') {
            const num = (repEvents.length === 0) ? ex.target : curVal;
            text = `${num} ${nameUpper}`;
        } else if (listFormat === 'static_target') {
            text = `${ex.target} ${nameUpper}`;
        } else if (listFormat === 'live_first') {
            text = `${curVal} ${nameUpper}`;
        } else if (listFormat === 'count_target') {
            text = `${nameUpper} ${curVal}/${ex.target}`;
        } else if (listFormat === 'front_slash') {
            text = `${curVal}/${ex.target} ${nameUpper}`;
        } else {
            text = `${nameUpper} ${curVal}`;
        }
        lines.push({ text, isAct, idx });
    });

    if (lines.length === 0 && !wodHeader) return;

    ctx.save();
    ctx.translate(listPos.x, listPos.y);
    ctx.scale(listScale, listScale);

    let maxW = 240;
    if (wodHeader) {
        ctx.font = `900 50px ${fontFam}`;
        maxW = Math.max(maxW, ctx.measureText(wodHeader).width);
    }
    ctx.font = `900 42px ${fontFam}`;
    lines.forEach(l => {
        maxW = Math.max(maxW, ctx.measureText(l.text).width + 36);
    });

    const padX = 38, padY = 26;
    const headerH = wodHeader ? 68 : 0;
    const rowH = 54;
    const boxW = maxW + padX * 2;
    const boxH = padY * 2 + headerH + (lines.length * rowH);
    const leftX = -boxW / 2, topY = -45;
    const bgRgba = hexToRgbaWorkout(bgHex, bgOpacity);

    // Gambar Container sesuai 10 Preset
    if (boxStyle === 'glass_card' && bgOpacity > 0.01) {
        ctx.fillStyle = bgRgba;
        ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, boxH, 20); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (boxStyle === 'header_banner') {
        if (bgOpacity > 0.01) {
            ctx.fillStyle = bgRgba;
            ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, boxH, 16); ctx.fill();
        }
        if (wodHeader) {
            ctx.fillStyle = headerColor;
            ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, headerH + 10, [16, 16, 0, 0]); ctx.fill();
        }
        ctx.strokeStyle = headerColor; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, boxH, 16); ctx.stroke();
    } else if (boxStyle === 'left_bar_card') {
        if (bgOpacity > 0.01) {
            ctx.fillStyle = bgRgba;
            ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, boxH, [4, 16, 16, 4]); ctx.fill();
        }
        ctx.fillStyle = headerColor; ctx.fillRect(leftX, topY, 8, boxH);
    } else if (boxStyle === 'tactical_brackets') {
        if (bgOpacity > 0.01) { ctx.fillStyle = bgRgba; ctx.fillRect(leftX, topY, boxW, boxH); }
        ctx.strokeStyle = headerColor; ctx.lineWidth = 3.5;
        const bLen = 22;
        ctx.beginPath();
        ctx.moveTo(leftX, topY + bLen); ctx.lineTo(leftX, topY); ctx.lineTo(leftX + bLen, topY);
        ctx.moveTo(leftX + boxW - bLen, topY); ctx.lineTo(leftX + boxW, topY); ctx.lineTo(leftX + boxW, topY + bLen);
        ctx.moveTo(leftX, topY + boxH - bLen); ctx.lineTo(leftX, topY + boxH); ctx.lineTo(leftX + bLen, topY + boxH);
        ctx.moveTo(leftX + boxW - bLen, topY + boxH); ctx.lineTo(leftX + boxW, topY + boxH); ctx.lineTo(leftX + boxW, topY + boxH - bLen);
        ctx.stroke();
    } else if (boxStyle === 'slanted_sport') {
        ctx.beginPath();
        ctx.moveTo(leftX + 18, topY); ctx.lineTo(leftX + boxW, topY);
        ctx.lineTo(leftX + boxW - 18, topY + boxH); ctx.lineTo(leftX, topY + boxH);
        ctx.closePath();
        if (bgOpacity > 0.01) { ctx.fillStyle = bgRgba; ctx.fill(); }
        ctx.strokeStyle = headerColor; ctx.lineWidth = 2.5; ctx.stroke();
    } else if (boxStyle === 'neon_border') {
        ctx.save();
        if (bgOpacity > 0.01) {
            ctx.fillStyle = bgRgba;
            ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, boxH, 18); ctx.fill();
        }
        ctx.shadowColor = headerColor; ctx.shadowBlur = 16;
        ctx.strokeStyle = headerColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(leftX, topY, boxW, boxH, 18); ctx.stroke();
        ctx.restore();
    } else if (boxStyle === 'crossfit_board') {
        if (bgOpacity > 0.01) { ctx.fillStyle = bgRgba; ctx.fillRect(leftX, topY, boxW, boxH); }
        ctx.fillStyle = headerColor; ctx.fillRect(leftX, topY, boxW, 6);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.strokeRect(leftX, topY, boxW, boxH);
    } else if (boxStyle === 'stencil_stamp') {
        if (bgOpacity > 0.01) { ctx.fillStyle = bgRgba; ctx.fillRect(leftX, topY, boxW, boxH); }
        ctx.strokeStyle = headerColor; ctx.lineWidth = 4.5; ctx.strokeRect(leftX, topY, boxW, boxH);
    }

    ctx.textAlign = align;
    let textAnchorX = 0;
    if (align === 'left') textAnchorX = leftX + padX;
    else if (align === 'right') textAnchorX = leftX + boxW - padX;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;

    let curY = topY + padY + 38;
    if (wodHeader) {
        ctx.fillStyle = (boxStyle === 'header_banner') ? '#09090b' : headerColor;
        ctx.font = `900 50px ${fontFam}`;
        ctx.fillText(wodHeader, textAnchorX, curY);

        if (boxStyle === 'crossfit_board' || boxStyle === 'glass_card') {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(leftX + 20, curY + 18); ctx.lineTo(leftX + boxW - 20, curY + 18); ctx.stroke();
        }
        curY += headerH;
    }

    lines.forEach((item, i) => {
        ctx.save();
        ctx.translate(0, curY + (i * rowH));

        if (boxStyle === 'row_pills' && bgOpacity > 0.01) {
            ctx.fillStyle = item.isAct ? hexToRgbaWorkout(activeColor, Math.min(0.95, bgOpacity + 0.15)) : bgRgba;
            ctx.beginPath(); ctx.roundRect(leftX + 10, -38, boxW - 20, 48, 24); ctx.fill();
            if (item.isAct) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke(); }
        } else if (boxStyle === 'crossfit_board' && i > 0) {
            ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(leftX + 16, -42); ctx.lineTo(leftX + boxW - 16, -42); ctx.stroke();
        }

        if (item.isAct && repPopScale > 1.0) {
            ctx.scale(repPopScale, repPopScale);
        }

        ctx.font = `900 42px ${fontFam}`;
        ctx.fillStyle = (boxStyle === 'row_pills' && item.isAct) ? '#09090b' : (item.isAct ? activeColor : textColor);
        ctx.fillText(item.text, textAnchorX, 0);

        if (item.isAct && boxStyle !== 'row_pills') {
            const tw = ctx.measureText(item.text).width;
            let dotX = -tw / 2 - 16;
            if (align === 'left') dotX = textAnchorX - 16;
            else if (align === 'right') dotX = textAnchorX - tw - 16;
            ctx.fillStyle = activeColor;
            ctx.beginPath(); ctx.arc(dotX, -14, 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    });

    ctx.textAlign = 'left';
    ctx.restore();
}

window.overlayRenderHooks.push(renderWorkoutOverlay);

// Keyboard Listeners: Spacebar, Angka 1-4, R, Backspace, Ctrl+Z, Ctrl+Y
window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redoWorkoutAction();
        else undoWorkoutAction();
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoWorkoutAction();
        return;
    }

    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) {
        const idx = parseInt(e.code.replace('Digit', ''), 10) - 1;
        if (exercises[idx] && exercises[idx].name.trim() !== '') {
            e.preventDefault();
            setActiveExercise(idx);
        }
    } else if (e.code === 'Space') {
        e.preventDefault();
        markRepNow();
    } else if (e.code === 'KeyR') {
        e.preventDefault();
        markRoundNow();
    } else if (e.code === 'Backspace') {
        e.preventDefault();
        undoWorkoutAction();
    }
});

// Sinkronisasi tampilan angka repetisi saat slider timeline digeser
document.getElementById('timelineSlider')?.addEventListener('input', () => {
    renderExerciseInputs();
});

// Drag & Drop Posisi Daftar Workout di Kanvas
canvas.addEventListener('mousedown', function(e) {
    if (!document.getElementById('showWorkoutList')?.checked) return;
    if ((typeof isDraggingHr !== 'undefined' && isDraggingHr) || (typeof isDraggingTimer !== 'undefined' && isDraggingTimer)) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (Math.hypot(mx - listPos.x, my - (listPos.y + 70)) < 160) {
        recordWorkoutHistory();
        isDraggingList = true;
        listDragOffset = { x: mx - listPos.x, y: my - listPos.y };
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingList) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    listPos = { x: mx - listDragOffset.x, y: my - listDragOffset.y };
    renderFrame();
});

window.addEventListener('mouseup', () => { isDraggingList = false; });

// Inisialisasi awal
renderExerciseInputs();
renderEventLog();
renderFrame();