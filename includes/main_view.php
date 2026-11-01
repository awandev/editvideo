<main class="flex-1 flex flex-col justify-between viewport-grid overflow-hidden relative">
    
    <!-- Area Kanvas Tengah -->
    <div class="flex-1 flex justify-center items-center p-6 overflow-hidden">
        <canvas id="hudCanvas" width="1080" height="1920"></canvas>
    </div>

    <!-- FLOATING SELECTION ACTION BAR (Muncul otomatis saat area timeline diblok / diklik) -->
    <div id="selectionActionBar" class="hidden absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#121215]/95 backdrop-blur-md border border-[#32323a] rounded-lg px-3 py-2 shadow-2xl z-30 flex flex-wrap items-center gap-2">
        <!-- Info Rentang Waktu -->
        <div class="flex items-center gap-1.5 pr-2 border-r border-[#27272a]">
            <span id="selStatusDot" class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span id="lblSelRangeInfo" class="text-[11px] font-mono-tech font-semibold text-zinc-200">00:10 — 00:25 (15.0s)</span>
        </div>

        <!-- Aksi 1: Cut / Hapus Area -->
        <button type="button" onclick="applyCutToSelection()" class="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1 transition" title="Cut selected range">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
            </svg>
            <span>Cut</span>
        </button>

        <!-- Aksi 2: Trim ke Area Ini -->
        <button type="button" onclick="applyTrimToSelection()" class="bg-[#18181c] hover:bg-[#222228] text-zinc-300 border border-[#27272a] text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1 transition" title="Crop whole video to this selection">
            <svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 2v14a2 2 0 002 2h14M18 22V8a2 2 0 00-2-2H2"/>
            </svg>
            <span>Trim</span>
        </button>

        <!-- Aksi 3: Local Speed Override -->
        <div class="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5">
            <span class="text-[10px] font-mono-tech text-zinc-500">Speed:</span>
            <select id="selRegionSpeed" class="bg-transparent text-[11px] font-mono-tech text-orange-400 focus:outline-none cursor-pointer">
                <option value="" class="bg-zinc-900">Default (Normal)</option>
                <option value="0.5" class="bg-zinc-900">0.5x Slow</option>
                <option value="1" class="bg-zinc-900">1.0x Normal</option>
                <option value="2" class="bg-zinc-900">2.0x Fast</option>
                <option value="5" class="bg-zinc-900">5.0x</option>
                <option value="10" class="bg-zinc-900">10x</option>
                <option value="20" class="bg-zinc-900">20x</option>
                <option value="50" class="bg-zinc-900">50x</option>
            </select>
        </div>

        <!-- Aksi 4: Local LUT Override -->
        <div class="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5">
            <span class="text-[10px] font-mono-tech text-zinc-500">FX:</span>
            <!-- Aksi 4: Local LUT Override (20 Grouped Workout LUTs) -->
        <div class="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5">
            <span class="text-[10px] font-mono-tech text-zinc-500">FX:</span>
            <select id="selRegionLut" class="bg-transparent text-[11px] font-mono-tech text-sky-400 focus:outline-none cursor-pointer max-w-[130px]">
                <option value="" class="bg-zinc-900">Default LUT</option>
                <optgroup label="1. Hardcore Grit" class="bg-zinc-900 text-orange-400">
                    <option value="bleach_grit" class="text-zinc-100">01 Bleach Grit</option>
                    <option value="iron_shadow" class="text-zinc-100">02 Dark Iron</option>
                    <option value="spartan_bronze" class="text-zinc-100">03 Spartan Bronze</option>
                    <option value="concrete_raw" class="text-zinc-100">04 Concrete Raw</option>
                    <option value="adrenaline_punch" class="text-zinc-100">05 Adrenaline HDR</option>
                </optgroup>
                <optgroup label="2. Cinema Gym" class="bg-zinc-900 text-sky-400">
                    <option value="teal_orange" class="text-zinc-100">06 Teal & Orange</option>
                    <option value="nike_commercial" class="text-zinc-100">07 Pro Commercial</option>
                    <option value="moody_dark" class="text-zinc-100">08 Moody Dark</option>
                    <option value="cyber_neon" class="text-zinc-100">09 Neon Night</option>
                    <option value="anamorphic_blue" class="text-zinc-100">10 Anamorphic Blue</option>
                </optgroup>
                <optgroup label="3. Outdoor Street" class="bg-zinc-900 text-emerald-400">
                    <option value="golden_hour" class="text-zinc-100">11 Golden Hour</option>
                    <option value="tropical_calisthenics" class="text-zinc-100">12 Tropical Sun</option>
                    <option value="urban_street" class="text-zinc-100">13 Urban Asphalt</option>
                    <option value="high_noon" class="text-zinc-100">14 Sun Recovery</option>
                    <option value="morning_mist" class="text-zinc-100">15 Crisp Morning</option>
                </optgroup>
                <optgroup label="4. B&W / Retro" class="bg-zinc-900 text-purple-400">
                    <option value="bw_noir" class="text-zinc-100">16 Silver Noir B&W</option>
                    <option value="bw_matte" class="text-zinc-100">17 Carbon Matte B&W</option>
                    <option value="bw_red_filter" class="text-zinc-100">18 Titanium B&W</option>
                    <option value="vhs_camcorder" class="text-zinc-100">19 90s Camcorder VHS</option>
                    <option value="kodachrome" class="text-zinc-100">20 Kodachrome 64</option>
                </optgroup>
            </select>
        </div>
        </div>

        <!-- Aksi 5: Local Camera Zoom Punch-In -->
        <div class="flex items-center gap-1 bg-[#09090b] border border-[#27272a] rounded px-1.5 py-0.5">
            <span class="text-[10px] font-mono-tech text-zinc-500">Zoom:</span>
            <select id="selRegionZoom" class="bg-transparent text-[11px] font-mono-tech text-emerald-400 focus:outline-none cursor-pointer">
                <option value="" class="bg-zinc-900">Default</option>
                <option value="1.15" class="bg-zinc-900">1.15x Punch</option>
                <option value="1.30" class="bg-zinc-900">1.30x Close</option>
                <option value="1.50" class="bg-zinc-900">1.50x Macro</option>
            </select>
        </div>

        <!-- Terapkan / Update Region FX -->
        <button type="button" onclick="applyFxToSelection()" class="bg-orange-500 hover:bg-orange-400 text-zinc-950 text-[11px] font-semibold px-2.5 py-1 rounded transition">
            Apply FX
        </button>

        <!-- BARU: Tombol Hapus / Reset Pengaturan Area (Muncul jika area punya Speed/FX/Cut) -->
        <button type="button" id="btnResetRegionFx" onclick="resetSelectionSettings()" class="hidden bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 text-[11px] font-medium px-2.5 py-1 rounded flex items-center gap-1 transition" title="Remove speed, FX, or cut settings in this area (Shortcut: Delete)">
            <svg class="w-3 h-3 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            <span id="lblResetRegionBtn">Reset Setting</span>
        </button>

        <!-- Loop Preview Area -->
        <button type="button" id="btnLoopSelection" onclick="toggleLoopSelection()" class="bg-[#18181c] hover:bg-[#222228] text-zinc-400 border border-[#27272a] text-[11px] font-mono-tech px-2 py-1 rounded transition" title="Loop playback inside selection">
            Loop
        </button>

        <!-- Tutup Seleksi -->
        <button type="button" onclick="clearTimelineSelection()" class="text-zinc-500 hover:text-zinc-200 px-1.5 py-1 text-xs font-mono-tech transition" title="Close bar (Esc)">
            ×
        </button>
    </div>

    <!-- Transport Deck & Interactive Timeline Bawah -->
    <div class="h-14 bg-[#0c0c0e] border-t border-[#232329] px-4 flex items-center gap-3 shrink-0">
        
        <!-- Tombol Transport & Set In/Out Selection -->
        <div class="flex items-center gap-1.5">
            <button onclick="jumpToTrimStart()" class="w-8 h-8 rounded bg-[#18181c] hover:bg-[#222228] border border-[#27272a] flex items-center justify-center text-zinc-300 transition" title="Go to In Point">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                </svg>
            </button>

            <button onclick="togglePlaySim()" id="btnPlaySim" class="w-9 h-8 rounded bg-zinc-100 hover:bg-white flex items-center justify-center text-zinc-950 transition" title="Play / Pause">
                <svg id="iconPlay" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <svg id="iconPause" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            </button>

            <!-- Tombol Mark In [I] & Mark Out [O] untuk Blok Area -->
            <div class="flex items-center gap-0.5 ml-1 bg-[#141418] p-0.5 rounded border border-[#232329]">
                <button type="button" onclick="setSelectionPoint('in')" class="px-2 py-1 rounded text-[10px] font-mono-tech text-zinc-300 hover:bg-[#222228] hover:text-amber-400 transition" title="Set Selection Start at current time (Shortcut: I)">
                    [ In
                </button>
                <button type="button" onclick="setSelectionPoint('out')" class="px-2 py-1 rounded text-[10px] font-mono-tech text-zinc-300 hover:bg-[#222228] hover:text-amber-400 transition" title="Set Selection End at current time (Shortcut: O)">
                    Out ]
                </button>
            </div>
        </div>

        <!-- Pintasan Tombol Speed Global (1x, 2x, 5x, 10x, 20x, 50x) -->
        <div class="hidden xl:flex items-center gap-0.5 bg-[#141418] p-0.5 rounded border border-[#232329]">
            <button type="button" onclick="setPlaybackSpeed(1)" data-speed="1" class="speed-btn bg-orange-500 text-zinc-950 font-mono-tech text-[10px] font-semibold px-2 py-1 rounded transition">1x</button>
            <button type="button" onclick="setPlaybackSpeed(2)" data-speed="2" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[10px] font-medium px-2 py-1 rounded transition">2x</button>
            <button type="button" onclick="setPlaybackSpeed(5)" data-speed="5" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[10px] font-medium px-2 py-1 rounded transition">5x</button>
            <button type="button" onclick="setPlaybackSpeed(10)" data-speed="10" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[10px] font-medium px-2 py-1 rounded transition">10x</button>
            <button type="button" onclick="setPlaybackSpeed(20)" data-speed="20" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[10px] font-medium px-2 py-1 rounded transition">20x</button>
            <button type="button" onclick="setPlaybackSpeed(50)" data-speed="50" class="speed-btn text-zinc-400 hover:text-zinc-200 font-mono-tech text-[10px] font-medium px-2 py-1 rounded transition">50x</button>
        </div>

        <!-- Timecode Berjalan -->
        <div class="text-xs font-mono-tech text-zinc-300 w-12 text-center" id="lblVideoTime">00:00</div>

        <!-- INTERACTIVE TIMELINE TRACK (Klik blok biru/merah untuk edit/hapus, atau drag untuk blok baru) -->
        <div class="flex-1 flex flex-col justify-center relative py-1 select-none">
            <div id="interactiveRegionBar" class="w-full h-3.5 bg-[#16161a] border border-[#27272a] rounded-sm overflow-hidden relative mb-1 cursor-crosshair" title="Click & drag to select range, or click an existing blue/red block to edit or remove it">
                <div id="visualCutTrack" class="absolute inset-0 pointer-events-none"></div>
            </div>
            <input type="range" id="timelineSlider" min="0" max="1200" step="0.1" value="0" oninput="onSliderChange(this.value)" class="w-full">
        </div>

        <!-- Timecode Durasi Akhir -->
        <div class="text-xs font-mono-tech text-zinc-500 w-12 text-center" id="lblTotalEnd">20:00</div>
    </div>
</main>