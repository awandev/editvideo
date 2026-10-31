/**
 * TOP TITLE / HEADER OVERLAY MODULE
 * Terhubung secara modular ke assets/app.js melalui window.overlayRenderHooks
 */

let titlePos = { x: 64, y: 88 };
let isDraggingTitle = false;
let titleDragOffset = { x: 0, y: 0 };

if (typeof modalTitles !== 'undefined') {
    modalTitles.title = 'Header & Title Overlay';
}

function hexToRgbaTitle(hex, alpha = 1) {
    hex = (hex || '#09090b').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 9;
    const g = parseInt(hex.substring(2, 4), 16) || 9;
    const b = parseInt(hex.substring(4, 6), 16) || 11;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resetTitlePosition() {
    snapTitlePosition('top_left');
}

function snapTitlePosition(preset) {
    const cW = canvas.width || 1080;
    const marginX = Math.round(cW * 0.055);
    const marginY = Math.round((canvas.height || 1920) * 0.05);

    if (preset === 'top_left') {
        titlePos = { x: marginX, y: marginY };
    } else if (preset === 'top_center') {
        titlePos = { x: Math.round(cW / 2) - 130, y: marginY };
    } else if (preset === 'top_right') {
        titlePos = { x: cW - marginX - 260, y: marginY };
    }
    renderFrame();
}

function renderTitleOverlay(ctx) {
    const showCheckbox = document.getElementById('showTopTitle');
    if (!showCheckbox || !showCheckbox.checked) return;

    const style     = document.getElementById('titleStyleSelect')?.value || 'cindy_redbar';
    const fontFam   = document.getElementById('titleFontSelect')?.value || "'Bebas Neue', sans-serif";
    const tagText   = (document.getElementById('titleTag')?.value || '').toUpperCase();
    const mainText  = (document.getElementById('titleMain')?.value || '').toUpperCase();
    const barColor  = document.getElementById('titleColorPicker')?.value || '#ef4444';
    const mainColor = document.getElementById('titleMainColor')?.value || '#ffffff';
    const bgHex     = document.getElementById('titleBgColor')?.value || '#09090b';
    const bgOpacity = parseFloat(document.getElementById('titleBgOpacity')?.value ?? 0.75);
    const userScale = parseFloat(document.getElementById('titleScale')?.value || 1.0);

    // Skala otomatis menyesuaikan resolusi kanvas (720p / 1080p / 1440p)
    const resFactor = Math.min(canvas.width, canvas.height) / 720;
    const finalScale = userScale * resFactor;
    const bgRgba = hexToRgbaTitle(bgHex, bgOpacity);

    ctx.save();
    ctx.translate(titlePos.x, titlePos.y);
    ctx.scale(finalScale, finalScale);

    if (style === 'cindy_redbar') {
        // 01: Vertical Accent Bar (DAY 26 / CINDY)
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = barColor;
        ctx.fillRect(0, 0, 14, 128);
        ctx.font = `900 44px ${fontFam}`;
        ctx.fillText(tagText, 28, 40);
        ctx.fillStyle = mainColor;
        ctx.font = `900 92px ${fontFam}`;
        ctx.fillText(mainText, 26, 124);

    } else if (style === 'broadcast_box') {
        // 02: Slanted Broadcast Lower-Third
        ctx.font = `900 64px ${fontFam}`;
        const w = Math.max(240, ctx.measureText(mainText).width + 56);
        const h = 108;
        if (bgOpacity > 0.01) {
            ctx.fillStyle = bgRgba;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w - 18, h); ctx.lineTo(0, h);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = barColor;
        ctx.fillRect(0, 0, 8, h);
        ctx.font = `800 26px ${fontFam}`;
        ctx.fillText(tagText, 22, 34);
        ctx.fillStyle = mainColor;
        ctx.font = `900 64px ${fontFam}`;
        ctx.fillText(mainText, 22, 92);

    } else if (style === 'solid_badge') {
        // 03: Solid Pill Tag + Headline
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 8;
        ctx.font = `800 30px ${fontFam}`;
        const tagW = Math.max(80, ctx.measureText(tagText).width + 28);
        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, tagW, 40, 6);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(tagText, 14, 30);

        ctx.fillStyle = mainColor;
        ctx.font = `900 86px ${fontFam}`;
        ctx.fillText(mainText, 0, 118);

    } else if (style === 'clean_outline') {
        // 04: Hollow Stroke Headline
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 8;
        ctx.fillStyle = barColor;
        ctx.font = `900 40px ${fontFam}`;
        ctx.fillText(tagText, 0, 36);

        ctx.font = `900 90px ${fontFam}`;
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = mainColor;
        ctx.strokeText(mainText, 0, 116);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillText(mainText, 0, 116);

    } else if (style === 'neon_underline') {
        // 05: Luminous Bottom Rule
        ctx.save();
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 14;
        ctx.fillStyle = barColor;
        ctx.font = `800 30px ${fontFam}`;
        ctx.fillText(`// ${tagText}`, 0, 28);
        ctx.fillStyle = mainColor;
        ctx.font = `900 82px ${fontFam}`;
        ctx.fillText(mainText, 0, 102);
        const mw = Math.max(160, ctx.measureText(mainText).width);
        ctx.fillStyle = barColor;
        ctx.fillRect(0, 114, mw, 7);
        ctx.restore();

    } else if (style === 'crossfit_bracket') {
        // 06: Corner Reticle Brackets
        ctx.font = `900 70px ${fontFam}`;
        const mw = Math.max(210, ctx.measureText(mainText).width + 44);
        const mh = 112;
        if (bgOpacity > 0.01) {
            ctx.fillStyle = bgRgba;
            ctx.fillRect(0, 0, mw, mh);
        }
        ctx.strokeStyle = barColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 24); ctx.lineTo(0, 0); ctx.lineTo(24, 0);
        ctx.moveTo(mw - 24, mh); ctx.lineTo(mw, mh); ctx.lineTo(mw, mh - 24);
        ctx.stroke();

        ctx.fillStyle = barColor;
        ctx.font = `800 25px ${fontFam}`;
        ctx.fillText(tagText, 18, 34);
        ctx.fillStyle = mainColor;
        ctx.font = `900 70px ${fontFam}`;
        ctx.fillText(mainText, 18, 96);

    } else if (style === 'split_capsule') {
        // 07: Two-Tone Split Capsule
        ctx.font = `800 42px ${fontFam}`;
        const w1 = Math.max(90, ctx.measureText(tagText).width + 34);
        ctx.font = `900 46px ${fontFam}`;
        const w2 = Math.max(120, ctx.measureText(mainText).width + 40);
        const h = 64;

        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, w1, h, [32, 0, 0, 32]);
        ctx.fill();

        ctx.fillStyle = bgRgba;
        ctx.beginPath();
        ctx.roundRect(w1, 0, w2, h, [0, 32, 32, 0]);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `800 42px ${fontFam}`;
        ctx.fillText(tagText, 18, 46);
        ctx.fillStyle = mainColor;
        ctx.font = `900 46px ${fontFam}`;
        ctx.fillText(mainText, w1 + 18, 48);

    } else if (style === 'stencil_stamp') {
        // 08: Heavy Framed Box Stamp
        ctx.font = `900 72px ${fontFam}`;
        const mw = Math.max(220, ctx.measureText(mainText).width + 44);
        const mh = 116;
        if (bgOpacity > 0.01) {
            ctx.fillStyle = bgRgba;
            ctx.fillRect(0, 0, mw, mh);
        }
        ctx.strokeStyle = barColor;
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, mw, mh);
        ctx.fillStyle = barColor;
        ctx.fillRect(0, 0, mw, 34);

        ctx.fillStyle = '#09090b';
        ctx.font = `900 24px ${fontFam}`;
        ctx.fillText(tagText, 14, 25);

        ctx.fillStyle = mainColor;
        ctx.font = `900 72px ${fontFam}`;
        ctx.fillText(mainText, 16, 100);

    } else if (style === 'minimal_stack') {
        // 09: Frameless Stacked Text
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = barColor;
        ctx.font = `800 34px ${fontFam}`;
        ctx.fillText(tagText, 0, 32);
        ctx.fillStyle = mainColor;
        ctx.font = `900 88px ${fontFam}`;
        ctx.fillText(mainText, 0, 110);

    } else {
        // 10: Technical Top-Rule Header
        ctx.font = `900 74px ${fontFam}`;
        const mw = Math.max(200, ctx.measureText(mainText).width + 20);
        ctx.fillStyle = barColor;
        ctx.fillRect(0, 0, mw, 5);
        ctx.font = `700 24px 'JetBrains Mono', monospace`;
        ctx.fillText(`SYS.LOG // ${tagText}`, 0, 30);
        ctx.fillStyle = mainColor;
        ctx.font = `900 74px ${fontFam}`;
        ctx.fillText(mainText, 0, 102);
    }

    ctx.restore();
}

// Daftarkan ke dalam Hook Render Utama
window.overlayRenderHooks.push(renderTitleOverlay);

// Drag & Drop Posisi Judul di Kanvas
canvas.addEventListener('mousedown', function(e) {
    if (!document.getElementById('showTopTitle')?.checked) return;
    if ((typeof isDraggingHr !== 'undefined' && isDraggingHr) ||
        (typeof isDraggingTimer !== 'undefined' && isDraggingTimer) ||
        (typeof isDraggingList !== 'undefined' && isDraggingList)) return;

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const resFactor = Math.min(canvas.width, canvas.height) / 720;
    const hitW = 240 * resFactor;
    const hitH = 120 * resFactor;

    if (mx >= titlePos.x - 20 && mx <= titlePos.x + hitW &&
        my >= titlePos.y - 20 && my <= titlePos.y + hitH) {
        isDraggingTitle = true;
        titleDragOffset = { x: mx - titlePos.x, y: my - titlePos.y };
    }
});

window.addEventListener('mousemove', function(e) {
    if (!isDraggingTitle) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    titlePos = { x: Math.round(mx - titleDragOffset.x), y: Math.round(my - titleDragOffset.y) };
    renderFrame();
});

window.addEventListener('mouseup', () => { isDraggingTitle = false; });