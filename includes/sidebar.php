<!-- Rail Navigasi Ikon (56px) -->
<aside class="w-14 bg-[#0c0c0e] border-r border-[#232329] flex flex-col items-center py-2 gap-1 shrink-0 z-20">
    <!-- Tombol 1: Media -->
    <button onclick="openSideModal('video')" id="nav_video" class="rail-btn active w-11 h-11 rounded-md flex flex-col items-center justify-center gap-1" title="Media & Transform">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M10 4v4M2 8h20M6 4v4"/>
        </svg>
        <span class="text-[9px] font-medium tracking-tight">Media</span>
    </button>

    <!-- Tombol 2: Heart Rate -->
    <button onclick="openSideModal('hr')" id="nav_hr" class="rail-btn w-11 h-11 rounded-md flex flex-col items-center justify-center gap-1" title="Heart Rate Telemetry">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        <span class="text-[9px] font-medium tracking-tight">BPM</span>
    </button>

    <!-- Tombol 3: Timer Durasi -->
    <button onclick="openSideModal('timer')" id="nav_timer" class="rail-btn w-11 h-11 rounded-md flex flex-col items-center justify-center gap-1" title="Duration Timer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <circle cx="12" cy="13" r="8"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4l2 2M9 2h6"/>
        </svg>
        <span class="text-[9px] font-medium tracking-tight">Timer</span>
    </button>

    <!-- Tombol 4: Daftar Workout & Spasi -->
    <button onclick="openSideModal('workout')" id="nav_workout" class="rail-btn w-11 h-11 rounded-md flex flex-col items-center justify-center gap-1" title="Workout List & Spacebar Logger">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01"/>
        </svg>
        <span class="text-[9px] font-medium tracking-tight">WOD</span>
    </button>

    <!-- Tombol 5: Audio Mixer & LUT Color Grading (BARU) -->
    <button onclick="openSideModal('audio_lut')" id="nav_audio_lut" class="rail-btn w-11 h-11 rounded-md flex flex-col items-center justify-center gap-1" title="Color LUT & Audio Mixer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
        </svg>
        <span class="text-[9px] font-medium tracking-tight">FX/Mix</span>
    </button>

    <!-- Tombol 6: Header / Top Title (BARU) -->
    <button onclick="openSideModal('title')" id="nav_title" class="rail-btn w-11 h-11 rounded-md flex flex-col items-center justify-center gap-1" title="Header & Title Overlay">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">
            <polyline points="4 7 4 4 20 4 20 7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
        </svg>
        <span class="text-[9px] font-medium tracking-tight">Title</span>
    </button>
</aside>

<!-- Panel Inspector Samping -->
<div id="sideModalContainer" class="w-80 bg-[#121215] border-r border-[#232329] h-full flex flex-col shrink-0 z-10 overflow-hidden">
    <div class="h-10 px-4 border-b border-[#232329] flex items-center justify-between">
        <span id="sideModalTitle" class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Media & Transform
        </span>
        <button onclick="closeSideModal()" class="text-zinc-500 hover:text-zinc-200 p-1 rounded transition" title="Close Inspector">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    </div>

    <div class="flex-1 overflow-y-auto divide-y divide-[#232329]">
        <?php include 'components/tab_video.php'; ?>
        <?php include 'components/tab_hr.php'; ?>
        <?php include 'components/tab_timer.php'; ?>
        <?php include 'components/tab_workout.php'; ?>
        <?php include 'components/tab_audio_lut.php'; ?>
        <?php include 'components/tab_title.php'; ?>
    </div>
</div>