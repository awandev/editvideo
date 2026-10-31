const canvas = document.getElementById('hudCanvas');
const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
const hiddenVideo = document.getElementById('hiddenVideo');

let bgImage = null;
let useVideoBg = false;
let currentVideoSec = 0;
let trimStartTotalSec = 0;
let trimEndTotalSec = 1200;
let playbackSpeed = 1.0;

let isPlayingSim = false;
let animFrameId = null;
let lastTick = 0;

// Hook modular untuk komponen overlay (HR, Timer, Workout, dll)
window.overlayRenderHooks = [];

let currentActiveTab = 'video';
let isModalOpen = true;

const modalTitles = {
    video: 'Media & Transform'
};

function openSideModal(tabName) {
    const container = document.getElementById('sideModalContainer');
    if (currentActiveTab === tabName && isModalOpen) {
        closeSideModal();
        return;
    }
    currentActiveTab = tabName;
    isModalOpen = true;
    container.classList.remove('hidden');

    document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('nav_' + tabName)?.classList.add('active');

    document.querySelectorAll('.modal-pane').forEach(p => p.classList.add('hidden'));
    document.getElementById('tab_' + tabName)?.classList.remove('hidden');

    document.getElementById('sideModalTitle').innerText = modalTitles[tabName] || 'Inspector';
}

function closeSideModal() {
    document.getElementById('sideModalContainer').classList.add('hidden');
    document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
    isModalOpen = false;
}

function formatMMSS(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// Ubah Rasio & Resolusi (720p / 1080p Full HD / 1440p 2K) dengan tetap menjaga posisi widget
function changeAspectRatio(ratio) {
    const prevW = canvas.width || 720;
    const prevH = canvas.height || 1280;
    const baseShortSide = parseInt(document.getElementById('exportResSelect')?.value || 1080, 10);

    let newW, newH;
    if (ratio === '9:16') {
        newW = baseShortSide;
        newH = Math.round(baseShortSide * (16 / 9));
    } else if (ratio === '1:1') {
        newW = baseShortSide;
        newH = baseShortSide;
    } else {
        newW = Math.round(baseShortSide * (16 / 9));
        newH = baseShortSide;
    }

    canvas.width = newW;
    canvas.height = newH;

    // Sesuaikan koordinat posisi widget secara proporsional jika resolusi berubah
    const scaleX = newW / prevW;
    const scaleY = newH / prevH;
    if (typeof hrPos !== 'undefined')    { hrPos.x = Math.round(hrPos.x * scaleX); hrPos.y = Math.round(hrPos.y * scaleY); }
    if (typeof timerPos !== 'undefined') { timerPos.x = Math.round(timerPos.x * scaleX); timerPos.y = Math.round(timerPos.y * scaleY); }
    if (typeof listPos !== 'undefined')  { listPos.x = Math.round(listPos.x * scaleX); listPos.y = Math.round(listPos.y * scaleY); }

    renderFrame();
}

function resetCameraFraming() {
    document.getElementById('camZoom').value = 1.0;
    document.getElementById('camPanX').value = 0;
    document.getElementById('camPanY').value = 0;
    document.getElementById('lblCamZoom').innerText = '100%';
    document.getElementById('lblCamPanX').innerText = '0 px';
    document.getElementById('lblCamPanY').innerText = '0 px';
    renderFrame();
}

function setPlaybackSpeed(spd) {
    playbackSpeed = spd;

    const hiddenInput = document.getElementById('exportSpeedSelect');
    if (hiddenInput) hiddenInput.value = String(spd);

    const lblSpeed = document.getElementById('lblSpeedInfo');
    if (lblSpeed) lblSpeed.innerText = `${spd}x`;

    // Update highlight warna tombol speed di Inspector & Transport Bar
    document.querySelectorAll('.speed-btn').forEach(btn => {
        const btnSpd = parseFloat(btn.getAttribute('data-speed'));
        if (btnSpd === spd) {
            btn.className = btn.className
                .replace(/text-zinc-400|hover:text-zinc-200|font-medium/g, '')
                .trim() + ' bg-orange-500 text-zinc-950 font-semibold';
        } else {
            btn.className = btn.className
                .replace(/bg-orange-500|text-zinc-950|font-semibold/g, '')
                .trim() + ' text-zinc-400 hover:text-zinc-200 font-medium';
        }
    });

    if (useVideoBg) {
        if (spd <= 16) {
            hiddenVideo.playbackRate = spd;
            if (isPlayingSim && hiddenVideo.paused) {
                hiddenVideo.currentTime = currentVideoSec;
                hiddenVideo.play().catch(() => {});
            }
        } else {
            // Untuk 20x dan 50x, matikan play() bawaan (karena browser mentok di 16x) dan gunakan manual frame-stepper
            hiddenVideo.pause();
        }
    }
}

function updateTiming() {
    const sMin = parseInt(document.getElementById('trimStartMin').value || 0, 10);
    const sSec = parseInt(document.getElementById('trimStartSec').value || 0, 10);
    trimStartTotalSec = (sMin * 60) + sSec;

    const eMin = parseInt(document.getElementById('trimEndMin').value || 20, 10);
    const eSec = parseInt(document.getElementById('trimEndSec').value || 0, 10);
    trimEndTotalSec = Math.max(trimStartTotalSec + 5, (eMin * 60) + eSec);

    const slider = document.getElementById('timelineSlider');
    slider.max = trimEndTotalSec;
    document.getElementById('lblTrimRange').innerText = `${formatMMSS(trimStartTotalSec)} — ${formatMMSS(trimEndTotalSec)}`;
    document.getElementById('lblTotalEnd').innerText = formatMMSS(trimEndTotalSec);

    if (currentVideoSec < trimStartTotalSec) {
        currentVideoSec = trimStartTotalSec;
        slider.value = currentVideoSec;
    }
    renderFrame();
}

function jumpToTrimStart() {
    currentVideoSec = trimStartTotalSec;
    document.getElementById('timelineSlider').value = currentVideoSec;
    if (useVideoBg) hiddenVideo.currentTime = currentVideoSec;
    renderFrame();
}

function drawMediaWithPanZoom(ctx, media, mW, mH, cW, cH) {
    const camZoom = parseFloat(document.getElementById('camZoom').value || 1.0);
    const camPanX = parseFloat(document.getElementById('camPanX').value || 0);
    const camPanY = parseFloat(document.getElementById('camPanY').value || 0);

    const baseScale = Math.max(cW / mW, cH / mH) * camZoom;
    const dW = mW * baseScale;
    const dH = mH * baseScale;
    const dx = ((cW - dW) / 2) + camPanX;
    const dy = ((cH - dH) / 2) + camPanY;

    ctx.drawImage(media, dx, dy, dW, dH);
}

function renderFrame() {
    // Pastikan interpolasi piksel kanvas berada di kualitas tertinggi
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isGreen = document.getElementById('greenScreenMode').checked;

    if (isGreen) {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (useVideoBg && hiddenVideo.readyState >= 2) {
        window.drawMediaWithPanZoom(ctx, hiddenVideo, hiddenVideo.videoWidth, hiddenVideo.videoHeight, canvas.width, canvas.height);
    } else if (bgImage) {
        window.drawMediaWithPanZoom(ctx, bgImage, bgImage.width, bgImage.height, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#0c0c0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#18181c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        ctx.fillStyle = '#52525b';
        ctx.font = '500 22px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NO SOURCE SIGNAL', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillStyle = '#3f3f46';
        ctx.font = '400 15px "Inter", sans-serif';
        ctx.fillText(`${canvas.width} × ${canvas.height}p`, canvas.width / 2, canvas.height / 2 + 18);
        ctx.textAlign = 'left';
    }

    document.getElementById('lblVideoTime').innerText = formatMMSS(currentVideoSec);
    window.overlayRenderHooks.forEach(hookFn => hookFn(ctx, canvas));
}

function onSliderChange(val) {
    currentVideoSec = parseFloat(val);
    if (useVideoBg && Math.abs(hiddenVideo.currentTime - currentVideoSec) > 0.2) {
        hiddenVideo.currentTime = currentVideoSec;
    }
    renderFrame();
}

function setPlayButtonState(playing) {
    const iconPlay = document.getElementById('iconPlay');
    const iconPause = document.getElementById('iconPause');
    if (playing) {
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
    } else {
        iconPlay.classList.remove('hidden');
        iconPause.classList.add('hidden');
    }
}

function animationLoop(timestamp) {
    if (!isPlayingSim) return;
    if (!lastTick) lastTick = timestamp;
    const realDeltaSec = (timestamp - lastTick) / 1000;
    lastTick = timestamp;

    if (useVideoBg && playbackSpeed <= 16 && !hiddenVideo.paused) {
        currentVideoSec = hiddenVideo.currentTime;
    } else {
        // Berjalan untuk kecepatan 20x & 50x (atau saat menggunakan foto statis)
        currentVideoSec += realDeltaSec * playbackSpeed;
        if (useVideoBg && !hiddenVideo.seeking) {
            hiddenVideo.currentTime = Math.min(hiddenVideo.duration || trimEndTotalSec, currentVideoSec);
        }
    }

    if (currentVideoSec >= trimEndTotalSec || (useVideoBg && hiddenVideo.ended)) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            window.toggleRecording();
            return;
        }
        currentVideoSec = trimStartTotalSec;
        if (useVideoBg) hiddenVideo.currentTime = trimStartTotalSec;
    }

    document.getElementById('timelineSlider').value = currentVideoSec;
    renderFrame();
    animFrameId = requestAnimationFrame(animationLoop);
}

function togglePlaySim() {
    if (isPlayingSim) {
        isPlayingSim = false;
        cancelAnimationFrame(animFrameId);
        if (useVideoBg) hiddenVideo.pause();
        setPlayButtonState(false);
    } else {
        if (currentVideoSec < trimStartTotalSec || currentVideoSec >= trimEndTotalSec) {
            currentVideoSec = trimStartTotalSec;
        }
        isPlayingSim = true;
        lastTick = 0;
        if (useVideoBg) {
            hiddenVideo.currentTime = currentVideoSec;
            if (playbackSpeed <= 16) {
                hiddenVideo.playbackRate = playbackSpeed;
                hiddenVideo.play().catch(() => {});
            } else {
                hiddenVideo.pause();
            }
        }
        setPlayButtonState(true);
        animFrameId = requestAnimationFrame(animationLoop);
    }
}

document.getElementById('bgVideoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    hiddenVideo.src = URL.createObjectURL(file);
    hiddenVideo.onloadedmetadata = function() {
        useVideoBg = true;
        const dur = Math.floor(hiddenVideo.duration || 60);
        document.getElementById('trimEndMin').value = Math.floor(dur / 60);
        document.getElementById('trimEndSec').value = dur % 60;
        document.getElementById('lblVideoStatus').innerText = `${file.name} [${hiddenVideo.videoWidth}×${hiddenVideo.videoHeight}]`;
        updateTiming();
        currentVideoSec = trimStartTotalSec;
        hiddenVideo.currentTime = trimStartTotalSec;
    };
    hiddenVideo.onseeked = () => renderFrame();
});

document.getElementById('bgImageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        const img = new Image();
        img.onload = function() {
            bgImage = img;
            useVideoBg = false;
            document.getElementById('lblVideoStatus').innerText = `${file.name} [${img.width}×${img.height}]`;
            renderFrame();
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

function downloadSnapshot() {
    renderFrame();
    const a = document.createElement('a');
    a.download = `frame_${canvas.width}x${canvas.height}_${formatMMSS(currentVideoSec).replace(':','-')}.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
}

// Codec High-Profile untuk 1080p/2K 60fps
function getHighQualityMimeType() {
    const candidates = [
        'video/mp4;codecs="avc1.640033, mp4a.40.2"', // H.264 High Profile Level 5.1 (2K/4K 60fps)
        'video/mp4;codecs="avc1.64002A, mp4a.40.2"', // H.264 High Profile Level 4.2 (1080p 60fps)
        'video/mp4;codecs=avc1.64002A',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=h264',
        'video/webm'
    ];
    for (const type of candidates) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
            return type;
        }
    }
    return '';
}

let mediaRecorder = null;
let recordedChunks = [];

function toggleRecording() {
    const btnText = document.getElementById('recBtnText');
    const recDot = document.getElementById('recDot');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        btnText.innerText = 'Export MP4';
        recDot.classList.remove('animate-ping');
        if (isPlayingSim) window.togglePlaySim();
        return;
    }

    const targetFps     = parseInt(document.getElementById('exportFpsSelect')?.value || 60, 10);
    const targetBitrate = parseInt(document.getElementById('exportBitrateSelect')?.value || 25000000, 10);

    currentVideoSec = trimStartTotalSec;
    if (useVideoBg) hiddenVideo.currentTime = trimStartTotalSec;

    // Tangkap stream sesuai FPS pilihan (60 FPS)
    const stream = canvas.captureStream(targetFps);
    if (useVideoBg && hiddenVideo.captureStream && playbackSpeed === 1) {
        try {
            const audioTracks = hiddenVideo.captureStream().getAudioTracks();
            if (audioTracks.length > 0) stream.addTrack(audioTracks[0]);
        } catch (e) {}
    }

    const mime = getHighQualityMimeType();
    const recorderOptions = {
        videoBitsPerSecond: targetBitrate,
        audioBitsPerSecond: 192000
    };
    if (mime) recorderOptions.mimeType = mime;

    mediaRecorder = new MediaRecorder(stream, recorderOptions);
    recordedChunks = [];
    mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
        const ext = (mime && mime.includes('webm')) ? 'webm' : 'mp4';
        const blob = new Blob(recordedChunks, { type: mime || 'video/mp4' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `render_${canvas.width}x${canvas.height}_${targetFps}fps.${ext}`;
        a.click();
    };

    mediaRecorder.start(1000);
    if (!isPlayingSim) window.togglePlaySim();
    btnText.innerText = `Stop (${targetFps}fps)`;
    recDot.classList.add('animate-ping');
}

// Set resolusi awal ke Full HD 1080p saat pertama kali dibuka
window.addEventListener('DOMContentLoaded', () => {
    changeAspectRatio(document.getElementById('aspectRatioSelect')?.value || '9:16');
    updateTiming();
    renderFrame();
});