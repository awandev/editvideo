<div id="tab_thumbnail" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- SEKSI 1: THUMBNAIL MODE & FRAME PICKER -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <div>
                <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-200 block">Thumbnail Studio Mode</span>
                <span class="text-[10px] text-zinc-500">Overlay dark scrim & poster typography</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="enableThumbMode" onchange="toggleThumbnailMode(this.checked)" class="sr-only peer">
                <div class="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <!-- Frame Grabber & Fine Frame Stepping -->
        <div class="bg-[#18181c] border border-[#27272a] rounded-md p-2.5 space-y-2">
            <div class="flex items-center justify-between text-[10px]">
                <span class="text-zinc-400 font-medium">Frame Picker (Cari Pose Terbaik)</span>
                <span id="lblThumbFrameTime" class="font-mono-tech text-orange-400">Live Frame</span>
            </div>

            <div class="grid grid-cols-4 gap-1">
                <button type="button" onclick="stepVideoFrame(-0.2)" class="bg-[#09090b] hover:bg-zinc-800 text-zinc-300 border border-[#27272a] rounded py-1.5 text-[10px] font-mono-tech transition" title="Back 0.2s">
                    -0.2s
                </button>
                <button type="button" onclick="stepVideoFrame(-0.04)" class="bg-[#09090b] hover:bg-zinc-800 text-zinc-300 border border-[#27272a] rounded py-1.5 text-[10px] font-mono-tech transition" title="Back 1 Frame">
                    -1 Fr
                </button>
                <button type="button" onclick="stepVideoFrame(0.04)" class="bg-[#09090b] hover:bg-zinc-800 text-zinc-300 border border-[#27272a] rounded py-1.5 text-[10px] font-mono-tech transition" title="Forward 1 Frame">
                    +1 Fr
                </button>
                <button type="button" onclick="stepVideoFrame(0.2)" class="bg-[#09090b] hover:bg-zinc-800 text-zinc-300 border border-[#27272a] rounded py-1.5 text-[10px] font-mono-tech transition" title="Forward 0.2s">
                    +0.2s
                </button>
            </div>

            <button type="button" id="btnFreezeThumb" onclick="toggleFreezeThumbFrame()" class="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                <span id="lblFreezeThumbBtn">Pause & Lock Pose Saat Ini</span>
            </button>
        </div>

        <label class="flex items-center justify-between pt-0.5 cursor-pointer">
            <span class="text-[11px] text-zinc-400">Hide Other Telemetry HUDs</span>
            <input type="checkbox" id="thumbHideOtherHud" checked onchange="renderFrame()" class="w-3.5 h-3.5 accent-orange-500 rounded bg-zinc-900 border-zinc-700">
        </label>

        <!-- Tombol Download Hasil Thumbnail -->
        <div class="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onclick="exportThumbnailImage('png')" class="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs py-2 px-2.5 rounded flex items-center justify-center gap-1.5 transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
                </svg>
                <span>Save PNG</span>
            </button>
            <button type="button" onclick="exportThumbnailImage('jpeg')" class="bg-[#18181c] hover:bg-[#222228] text-zinc-200 border border-[#27272a] font-medium text-xs py-2 px-2.5 rounded flex items-center justify-center gap-1.5 transition">
                <span>Save JPG (95%)</span>
            </button>
        </div>
    </div>

    <!-- SEKSI 2: DARKENING, VIGNETTE & PHOTO FX -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Dark Scrim & Photo FX</span>
            <button type="button" onclick="resetThumbExposure()" class="text-[10px] text-zinc-500 hover:text-zinc-200 transition">
                Reset FX
            </button>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Darkening Pattern (Scrim Mode)</label>
            <select id="thumbScrimMode" onchange="enableThumbOnEdit()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="bottom_heavy" selected>01 — Bottom Heavy Gradient (Classic)</option>
                <option value="radial_spotlight">02 — Radial Vignette Spotlight (Center Focus)</option>
                <option value="top_bottom">03 — Dual Top & Bottom Cinema Shade</option>
                <option value="left_heavy">04 — Left Side Scrim (For Left Text)</option>
                <option value="full_dim">05 — Uniform Full Frame Dim</option>
                <option value="diagonal_slash">06 — Angled Corner Dark Slash</option>
            </select>
        </div>

        <div class="space-y-2.5 pt-1">
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Darken Intensity</span>
                    <span id="lblThumbDark" class="font-mono-tech text-zinc-300">60%</span>
                </div>
                <input type="range" id="thumbDarkSlider" min="0" max="0.95" step="0.05" value="0.60" oninput="document.getElementById('lblThumbDark').innerText=Math.round(this.value*100)+'%'; enableThumbOnEdit();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Edge Vignette</span>
                    <span id="lblThumbVig" class="font-mono-tech text-zinc-300">65%</span>
                </div>
                <input type="range" id="thumbVigSlider" min="0" max="1.0" step="0.05" value="0.65" oninput="document.getElementById('lblThumbVig').innerText=Math.round(this.value*100)+'%'; enableThumbOnEdit();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Muscle Grit / Contrast Boost</span>
                    <span id="lblThumbContrast" class="font-mono-tech text-zinc-300">20%</span>
                </div>
                <input type="range" id="thumbContrastSlider" min="0" max="0.80" step="0.05" value="0.20" oninput="document.getElementById('lblThumbContrast').innerText=Math.round(this.value*100)+'%'; enableThumbOnEdit();" class="w-full">
            </div>
        </div>

        <label class="flex items-center justify-between pt-1 cursor-pointer">
            <span class="text-[11px] text-zinc-400">Monochrome B&W Photo (Colored Text)</span>
            <input type="checkbox" id="thumbBwPhoto" onchange="enableThumbOnEdit()" class="w-3.5 h-3.5 accent-orange-500 rounded bg-zinc-900 border-zinc-700">
        </label>
    </div>

    <!-- SEKSI 3: 20 GYM THUMBNAIL STYLES & CAPTIONS -->
    <div class="p-4 space-y-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">20 Gym Thumbnail Styles</div>

        <div>
            <select id="thumbStyleSelect" onchange="enableThumbOnEdit()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <optgroup label="Group 1 — YouTube & Reels High-Impact (5 Styles)" class="bg-zinc-900 text-orange-400">
                    <option value="yt_heavy_stack" selected class="text-zinc-100">01 — Giant 2-Tone Impact Stack</option>
                    <option value="yt_slanted_tape" class="text-zinc-100">02 — Slanted Warning Tape Bars</option>
                    <option value="yt_highlight_box" class="text-zinc-100">03 — Solid Action Box Highlight</option>
                    <option value="yt_outline_echo" class="text-zinc-100">04 — Triple Hollow Stroke Echo</option>
                    <option value="yt_versus_banner" class="text-zinc-100">05 — Top & Bottom Broadcast Split</option>
                </optgroup>

                <optgroup label="Group 2 — Calisthenics & Hardcore Grit (5 Styles)" class="bg-zinc-900 text-red-400">
                    <option value="cali_stencil_stamp" class="text-zinc-100">06 — Military Stencil Box Stamp</option>
                    <option value="cali_vertical_spine" class="text-zinc-100">07 — Vertical Spine + Giant Numbers</option>
                    <option value="cali_brutal_brackets" class="text-zinc-100">08 — Tactical Reticle + Slash Rule</option>
                    <option value="cali_raw_cutout" class="text-zinc-100">09 — Grunge Label Tape Cutout</option>
                    <option value="cali_wod_board" class="text-zinc-100">10 — CrossFit WOD Scoreboard Card</option>
                </optgroup>

                <optgroup label="Group 3 — Aesthetic & Magazine Cover (5 Styles)" class="bg-zinc-900 text-sky-400">
                    <option value="mag_cover_masthead" class="text-zinc-100">11 — Fitness Magazine Masthead</option>
                    <option value="mag_minimal_luxury" class="text-zinc-100">12 — Clean Athletic Editorial</option>
                    <option value="mag_glass_poster" class="text-zinc-100">13 — Frosted Glass Lower-Third</option>
                    <option value="mag_diagonal_split" class="text-zinc-100">14 — Dynamic Angled Corner Slash</option>
                    <option value="mag_neon_border" class="text-zinc-100">15 — Full-Frame Luminous Border</option>
                </optgroup>

                <optgroup label="Group 4 — Camcorder & Telemetry Proof (5 Styles)" class="bg-zinc-900 text-emerald-400">
                    <option value="cam_rec_poster" class="text-zinc-100">16 — VHS Camcorder Viewfinder</option>
                    <option value="strava_stat_hero" class="text-zinc-100">17 — Strava Giant Metric Poster</option>
                    <option value="hud_target_lock" class="text-zinc-100">18 — Biometric Target Crosshair</option>
                    <option value="cinema_letterbox" class="text-zinc-100">19 — 2.35:1 Cinema Widescreen Bars</option>
                    <option value="polaroid_docu" class="text-zinc-100">20 — Documentary Polaroid Frame</option>
                </optgroup>
            </select>
        </div>

        <div class="space-y-2 pt-0.5">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Top Badge / Day Tag</label>
                <input type="text" id="thumbBadgeText" value="DAY 29 CHALLENGE" oninput="enableThumbOnEdit()" placeholder="DAY 29 CHALLENGE" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[10px] text-zinc-500 mb-1">Main Hook (Line 1)</label>
                    <input type="text" id="thumbLine1Text" value="100 PULL UPS" oninput="enableThumbOnEdit()" placeholder="100 PULL UPS" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
                </div>
                <div>
                    <label class="block text-[10px] text-zinc-500 mb-1">Accent Hook (Line 2)</label>
                    <input type="text" id="thumbLine2Text" value="UNBROKEN" oninput="enableThumbOnEdit()" placeholder="UNBROKEN" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
                </div>
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Bottom Subtitle / Specs</label>
                <input type="text" id="thumbSubText" value="NO REST • 170 BPM PEAK • RAW FOOTAGE" oninput="enableThumbOnEdit()" placeholder="SUBTITLE / STATS" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
            </div>
        </div>
    </div>

    <!-- SEKSI 4: TYPOGRAPHY, COLORS & POSITION -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Typography & Colors</span>
            <button type="button" onclick="resetThumbPosition()" class="text-[10px] text-zinc-500 hover:text-zinc-200 transition">
                Reset Position
            </button>
        </div>

        <div>
            <select id="thumbFontSelect" onchange="enableThumbOnEdit()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="'Anton', sans-serif" selected>Anton — Heavy YouTube Impact</option>
                <option value="'Bebas Neue', sans-serif">Bebas Neue — Tall Athletic</option>
                <option value="'VCR OSD Mono', monospace">VCR OSD Mono — Camcorder Slashed Zero</option>
                <option value="'Russo One', sans-serif">Russo One — Hardcore Block</option>
                <option value="'Black Ops One', cursive">Black Ops One — Military Stencil</option>
                <option value="'Teko', sans-serif">Teko — Condensed Sport</option>
                <option value="'Barlow Condensed', sans-serif">Barlow Condensed — Broadcast</option>
                <option value="'Chakra Petch', sans-serif">Chakra Petch — Cyber Telemetry</option>
                <option value="'Montserrat', sans-serif">Montserrat — Modern Geometric</option>
                <option value="'Oswald', sans-serif">Oswald — Classic Editorial</option>
            </select>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Line 1 Text</span>
                <input type="color" id="thumbPrimaryColor" value="#ffffff" oninput="enableThumbOnEdit()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Line 2 Accent</span>
                <input type="color" id="thumbAccentColor" value="#facc15" oninput="enableThumbOnEdit()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Badge / Box</span>
                <input type="color" id="thumbBadgeColor" value="#ef4444" oninput="enableThumbOnEdit()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
        </div>

        <div>
            <div class="flex justify-between text-[11px] mb-1">
                <span class="text-zinc-400">Caption Scale</span>
                <span id="lblThumbScale" class="font-mono-tech text-zinc-300">100%</span>
            </div>
            <input type="range" id="thumbScaleSlider" min="0.5" max="1.6" step="0.05" value="1.0" oninput="document.getElementById('lblThumbScale').innerText=Math.round(this.value*100)+'%'; enableThumbOnEdit();" class="w-full">
        </div>

        <!-- Quick Snap Presets -->
        <div class="grid grid-cols-3 gap-1.5 pt-1">
            <button type="button" onclick="snapThumbPosition('top')" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[10px] font-mono-tech py-1.5 rounded transition">
                Top Third
            </button>
            <button type="button" onclick="snapThumbPosition('center')" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[10px] font-mono-tech py-1.5 rounded transition">
                Center
            </button>
            <button type="button" onclick="snapThumbPosition('bottom')" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[10px] font-mono-tech py-1.5 rounded transition">
                Bottom Third
            </button>
        </div>
    </div>

</div>