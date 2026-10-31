<div id="tab_title" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- SEKSI 1: VISIBILITY & PRESET STYLE -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Layer Visibility</span>
            <label class="relative inline-flex items-center cursor-pointer">
                <!-- Default tidak dicentang (nonaktif) -->
                <input type="checkbox" id="showTopTitle" onchange="renderFrame()" class="sr-only peer">
                <div class="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Header Style (10 Presets)</label>
            <select id="titleStyleSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="cindy_redbar">01 — Vertical Accent Bar (Classic)</option>
                <option value="broadcast_box">02 — Slanted Broadcast Lower-Third</option>
                <option value="solid_badge">03 — Solid Pill Tag + Headline</option>
                <option value="clean_outline">04 — Hollow Stroke Headline</option>
                <option value="neon_underline">05 — Luminous Bottom Rule</option>
                <option value="crossfit_bracket">06 — Corner Reticle Brackets</option>
                <option value="split_capsule">07 — Two-Tone Split Capsule</option>
                <option value="stencil_stamp">08 — Heavy Framed Box Stamp</option>
                <option value="minimal_stack">09 — Frameless Stacked Text</option>
                <option value="telemetry_tag">10 — Technical Top-Rule Header</option>
            </select>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Sub-Header / Tag</label>
                <input type="text" id="titleTag" value="DAY 26" oninput="renderFrame()" placeholder="DAY 26" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech uppercase">
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Main Headline</label>
                <input type="text" id="titleMain" value="CINDY" oninput="renderFrame()" placeholder="CINDY" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech uppercase">
            </div>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Typography</label>
            <select id="titleFontSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="'Bebas Neue', sans-serif">Bebas Neue — Condensed Tall</option>
                <option value="'Anton', sans-serif">Anton — Heavy Impact</option>
                <option value="'Teko', sans-serif">Teko — Square Athletic</option>
                <option value="'Barlow Condensed', sans-serif">Barlow Condensed — Broadcast</option>
                <option value="'Montserrat', sans-serif">Montserrat — Geometric Sans</option>
                <option value="'Chakra Petch', sans-serif">Chakra Petch — Technical</option>
                <option value="'Russo One', sans-serif">Russo One — Heavy Block</option>
                <option value="'Black Ops One', cursive">Black Ops One — Stencil</option>
                <option value="'Rajdhani', sans-serif">Rajdhani — Geometric</option>
                <option value="'Oswald', sans-serif">Oswald — Classic Din</option>
                <option value="'Orbitron', sans-serif">Orbitron — Sci-Fi Wide</option>
                <option value="'JetBrains Mono', monospace">JetBrains Mono — Tabular</option>
            </select>
        </div>
    </div>

    <!-- SEKSI 2: APPEARANCE & GEOMETRY -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Appearance</span>
            <button type="button" onclick="resetTitlePosition()" class="text-[11px] text-zinc-500 hover:text-zinc-200 transition">
                Reset Position
            </button>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Tag / Accent</span>
                <input type="color" id="titleColorPicker" value="#ef4444" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Headline</span>
                <input type="color" id="titleMainColor" value="#ffffff" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
            <label class="flex flex-col gap-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 cursor-pointer">
                <span class="text-[9px] text-zinc-400">Surface</span>
                <input type="color" id="titleBgColor" value="#09090b" oninput="renderFrame()" class="w-full h-4 rounded border-0 bg-transparent cursor-pointer">
            </label>
        </div>

        <div class="space-y-2.5 pt-1">
            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Scale</span>
                    <span id="lblTitleScale" class="font-mono-tech text-zinc-300">100%</span>
                </div>
                <input type="range" id="titleScale" min="0.5" max="1.8" step="0.05" value="1.0" oninput="document.getElementById('lblTitleScale').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>

            <div>
                <div class="flex justify-between text-[11px] mb-1">
                    <span class="text-zinc-400">Backdrop Opacity</span>
                    <span id="lblTitleOpacity" class="font-mono-tech text-zinc-300">75%</span>
                </div>
                <input type="range" id="titleBgOpacity" min="0" max="0.95" step="0.05" value="0.75" oninput="document.getElementById('lblTitleOpacity').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
            </div>
        </div>

        <!-- Quick Snap Alignment -->
        <div class="pt-1">
            <label class="block text-[10px] text-zinc-500 mb-1.5">Quick Snap Position</label>
            <div class="grid grid-cols-3 gap-1.5">
                <button type="button" onclick="snapTitlePosition('top_left')" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[10px] font-mono-tech py-1.5 rounded transition">
                    Top Left
                </button>
                <button type="button" onclick="snapTitlePosition('top_center')" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[10px] font-mono-tech py-1.5 rounded transition">
                    Top Center
                </button>
                <button type="button" onclick="snapTitlePosition('top_right')" class="bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-zinc-300 text-[10px] font-mono-tech py-1.5 rounded transition">
                    Top Right
                </button>
            </div>
        </div>
    </div>

</div>