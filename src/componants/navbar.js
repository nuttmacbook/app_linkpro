const navbar = /*html*/`
    <nav class="max-w-7xl mx-auto grid grid-cols-2">
        <div class="flex items-center gap-3">
            <img src="logo.png" class="w-8 h-8">
            <strong class="uppercase italic text-white drop-shadow-[0_0_12px_rgba(59,130,246,1)]">
                link
                <span class="text-blue-500/80">pro</span>
            </strong>
        </div>
        <div class="flex items-center gap-3 justify-end">
            <appKit-button balance="false" style="zoom: 90%;"></appKit-button>
        </div>
    </nav>
`;

export { navbar };