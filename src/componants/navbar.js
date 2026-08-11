const navbar = /*html*/`
    <nav class="max-w-7xl mx-auto grid grid-cols-2">
        <div class="flex items-center gap-3">
            <img src="logo.png" class="w-12 h-12">
            <strong class="uppercase italic text-gray-700">
                link <span class="text-blue-500/80">pro</span>
            </strong>
        </div>
        <div class="flex items-center gap-3 justify-end">
            <appKit-button balance="false"></appKit-button>
        </div>
    </nav>
`;

export { navbar };