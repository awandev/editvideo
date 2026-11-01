<div id="tab_template" class="modal-pane hidden divide-y divide-[#232329]">

    <!-- SEKSI 1: MASTER TEMPLATE LOCK SWITCH -->
    <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
            <div>
                <span class="text-[11px] font-semibold uppercase tracking-wider text-zinc-200 block">Master Template Mode</span>
                <span class="text-[10px] text-zinc-500">Locks individual widget styles (LUT stays unlocked)</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="enableMasterTemplate" onchange="toggleMasterTemplateMode(this.checked)" class="sr-only peer">
                <div class="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 peer-checked:after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
        </div>

        <!-- Indikator Status Lock -->
        <div id="tplLockBanner" class="hidden bg-orange-500/10 border border-orange-500/30 rounded-md px-3 py-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span class="text-[10px] text-orange-200 leading-tight">
                Style pada menu BPM, Timer, dan Title dikunci oleh Template. Pengaturan <b>LUT & Audio</b> tetap dapat diubah.
            </span>
        </div>

        <div>
            <label class="block text-[10px] text-zinc-500 mb-1">Select Preset Template</label>
            <select id="masterTemplateSelect" onchange="renderFrame()" class="input-tech w-full rounded px-2.5 py-1.5 text-xs">
                <option value="camcorder_vhs_01" selected>01 — Camcorder OSD (VHS Viewfinder)</option>
            </select>
        </div>
    </div>

    <!-- SEKSI 2: CAMCORDER TEXT & TELEMETRY CONTENT -->
    <div class="p-4 space-y-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Template Text & Options</div>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Top-Left Line 1</label>
                <input type="text" id="tplCamLine1" value="DAY 29" oninput="syncTemplateInputsToModules()" placeholder="DAY 29" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Top-Left Line 2</label>
                <input type="text" id="tplCamLine2" value="100 Pull ups" oninput="syncTemplateInputsToModules()" placeholder="100 Pull ups" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Top-Right Indicator</label>
                <input type="text" id="tplCamRec" value="REC" oninput="renderFrame()" placeholder="REC" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Bottom-Right Format</label>
                <input type="text" id="tplCamRes" value="HD 1080p" oninput="renderFrame()" placeholder="HD 1080p" class="input-tech w-full rounded px-2.5 py-1.5 text-xs font-mono-tech">
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">Heart Icon Behavior</label>
                <select id="tplCamHeartMode" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="pulse" selected>Pulsing (Berdenyut)</option>
                    <option value="static">Static (Diam)</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] text-zinc-500 mb-1">REC Red Dot</label>
                <select id="tplCamRecBlink" onchange="renderFrame()" class="input-tech w-full rounded px-2 py-1.5 text-xs">
                    <option value="blink" selected>Blinking on Play</option>
                    <option value="solid">Always Solid</option>
                </select>
            </div>
        </div>

        <div class="pt-1">
            <div class="flex justify-between text-[11px] mb-1">
                <span class="text-zinc-400">Edge Vignette Shade</span>
                <span id="lblTplVignette" class="font-mono-tech text-zinc-300">35%</span>
            </div>
            <input type="range" id="tplCamVignette" min="0" max="0.8" step="0.05" value="0.35" oninput="document.getElementById('lblTplVignette').innerText=Math.round(this.value*100)+'%'; renderFrame();" class="w-full">
        </div>
    </div>

</div>