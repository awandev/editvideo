<div id="tab_workout" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- SEKSI 1: VISIBILITY & SPACEBAR LOGGER CONTROLS -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Layer Visibility</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="showWorkoutList" onchange="renderFrame()" class="sr-only peer">
                <div class="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Spacebar Trigger Mode</label>
                <select id="spacebarMode" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="manual_select">Manual Select (Keys 1–4)</option>
                    <option value="auto_cycle">Auto-Cycle Target (WOD)</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Debounce Filter</label>
                <select id="debounceMsSelect" class="input-tech w-full rounded px-2 py-1.5 text-xs font-mono-tech">
                    <option value="250">250 ms — Standard</option>
                    <option value="500">500 ms — Strict</option>
                    <option value="0">0 ms — Off</option>
                </select>
            </div>
        </div>

        <!-- Tombol Trigger Repetisi, Ronde & Undo/Redo -->
        <div class="grid grid-cols-4 gap-1.5 pt-1">
            <button type="button" onclick="markRepNow()" class="col-span-2 bg-zinc-100 hover:bg-white active:scale-[0.98] text-zinc-950 font-semibold text-xs py-2 px-2.5 rounded flex items-center justify-center gap-1.5 transition" title="Shortcut: Spacebar">
                <span class="font-mono-tech font-bold">+1</span>
                <span>Rep [Space]</span>
            </button>
            <button type="button" onclick="markRoundNow()" class="bg-[#18181c] hover:bg-[#222228] text-zinc-200 border border-[#27272a] font-medium text-xs py-2 px-2 rounded transition" title="Shortcut: Key R">
                +Rnd [R]
            </button>
            <div class="grid grid-cols-2 gap-1">
                <button type="button" id="btnWorkoutUndo" onclick="undoWorkoutAction()" disabled class="bg-[#18181c] hover:bg-[#222228] disabled:opacity-30 text-zinc-300 border border-[#27272a] rounded flex items-center justify-center transition" title="Undo (Ctrl+Z / Backspace)">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"/>
                    </svg>
                </button>
                <button type="button" id="btnWorkoutRedo" onclick="redoWorkoutAction()" disabled class="bg-[#18181c] hover:bg-[#222228] disabled:opacity-30 text-zinc-300 border border-[#27272a] rounded flex items-center justify-center transition" title="Redo (Ctrl+Y)">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- SEKSI 2: WORKOUT HEADER & EXERCISE LIST -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Exercise List</span>
            <span id="lblActiveExBadge" class="text-[10px] font-mono-tech text-orange-400">Active: [1]</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Header Title</label>
                <input type="text" id="wodHeader" value="10 ROUND" oninput="renderFrame()" placeholder="10 ROUND / AMRAP 20" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech uppercase">
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Row Display Format</label>
                <select id="listDisplayFormat" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="target_first_live">10 PUSH UPS (Tgt → Live)</option>
                    <option value="static_target">10 PUSH UPS (Static Target)</option>
                    <option value="live_first">0 PUSH UPS (Live Leading)</option>
                    <option value="name_count">PUSH UPS 0 (Live Trailing)</option>
                    <option value="count_target">PUSH UPS 0/10 (Fraction)</option>
                    <option value="front_slash">0/10 PUSH UPS (Leading Frac)</option>
                </select>
            </div>
        </div>

        <!-- Baris Input 4 Gerakan (Di-render via JS) -->
        <div class="space-y-1.5 pt-1" id="exerciseRowsContainer"></div>
    </div>

    <!-- SEKSI 3: CONTAINER STYLE & TYPOGRAPHY -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Container & Typography</span>
            <button type="button" onclick="resetWorkoutListPosition()" class="text-[11px] text-zinc-500 hover:text-zinc-200 transition">
                Reset Position
            </button>
        </div>

        <div class="grid grid-cols-3 gap-2">
            <div class="col-span-2">
                <label class="block text-[10px] text-zinc-500 mb-1">Container Style (10 Presets)</label>
                <select id="listBoxStyleSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="glass_card">01 — Frosted Glass Card</option>
                    <option value="header_banner">02 — Solid Header Banner</option>
                    <option value="row_pills">03 — Segmented Row Pills</option>
                    <option value="left_bar_card">04 — Left Accent Bar</option>
                    <option value="tactical_brackets">05 — Corner Reticle Brackets</option>
                    <option value="slanted_sport">06 — Slanted Broadcast Panel</option>
                    <option value="neon_border">07 — Luminous Frame</option>
                    <option value="crossfit_board">08 — Divided Scoreboard</option>
                    <option value="stencil_stamp">09 — Heavy Border Box</option>
                    <option value="frameless_shadow">10 — Frameless Clean Text</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Alignment</label>
                <select id="listAlignSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                </select>
            </div>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Font Family</label>
            <select id="listFontSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="'Montserrat', sans-serif">Montserrat — Geometric Sans</option>
                <option value="'Bebas Neue', sans-serif">Bebas Neue — Condensed Tall</option>
                <option value="'Chakra Petch', sans-serif">Chakra Petch — Technical</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono — Tabular</option>
                <option value="'Teko', sans-serif">Teko — Square Athletic</option>
                <option value="'Barlow Condensed', sans-serif">Barlow Condensed — Broadcast</option>
                <option value="'Rajdhani', sans-serif">Rajdhani — Geometric</option>
                <option value="'Russo One', sans-serif">Russo One — Heavy Block</option>
                <option value="'Black Ops One', cursive">Black Ops One — Stencil</option>
                <option value="'Anton', sans-serif">Anton — Impact</option>
                <option value="'Orbitron', sans-serif">Orbitron — Sci-Fi Wide</option>
                <option value="'Oswald', sans-serif">Oswald — Classic Din</option>
            </select>
        </div>

        <div class="grid grid-cols-4 gap-1.5 pt-1">
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Header</span>
                <input type="color" id="listHeaderColor" value="#f59e0b" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Active</span>
                <input type="color" id="listActiveColor" value="#10b981" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Idle Text</span>
                <input type="color" id="listTextColor" value="#ffffff" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Surface</span>
                <input type="color" id="listBgColor" value="#09090b" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
        </div>

        <div class="space-y-2.5 pt-1">
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Scale</span>
                    <span id="lblListScale" class="font-mono-tech text-zinc-300">100%</span>
                </div>
                <input type="range" id="listScaleSlider" min="0.5" max="1.6" step="0.05" value="1.0" oninput="document.getElementById('lblListScale').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Surface Opacity</span>
                    <span id="lblListOpacity" class="font-mono-tech text-zinc-300">70%</span>
                </div>
                <input type="range" id="listBgOpacity" min="0" max="0.95" step="0.05" value="0.70" oninput="document.getElementById('lblListOpacity').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>
        </div>
    </div>

    <!-- SEKSI 4: TIMECODE EVENT LOG -->
    <div class="p-4 space-y-2.5">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Event Log</span>
            <div class="flex items-center gap-2">
                <button type="button" onclick="generateDemoMultiReps()" class="text-[10px] text-orange-400 hover:text-orange-300 transition">
                    Populate Demo
                </button>
                <span class="text-zinc-700">|</span>
                <button type="button" onclick="clearAllReps()" class="text-[10px] text-zinc-500 hover:text-red-400 transition">
                    Clear All
                </button>
            </div>
        </div>

        <div id="eventLogList" class="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono-tech text-[11px]"></div>
    </div>

</div>