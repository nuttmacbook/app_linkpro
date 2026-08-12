const navbar = /*html*/`
    <header class="w-full">
        <nav class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">

            <!-- Wordmark -->
            <a href="/" class="group flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 sm:gap-3">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/10 ring-1 ring-inset ring-sky-400/30 transition-colors group-hover:ring-sky-400/60 sm:h-9 sm:w-9">
                    <img src="logo.png" alt="Link Pro" class="h-5 w-5">
                </span>
                <strong class="truncate text-base font-extrabold uppercase italic leading-none tracking-tight text-white drop-shadow-[0_0_10px_rgba(56,189,248,0.45)] sm:text-lg">
                    link <span class="text-sky-400">pro</span>
                </strong>
            </a>

            <!-- Wallet -->
            <div class="flex shrink-0 items-center gap-2 [zoom:85%] sm:gap-3 sm:[zoom:90%]">
                <appKit-button balance="hide"></appKit-button>
            </div>
        </nav>

        <!-- เส้นเรืองแสงคั่นด้านล่าง -->
        <div class="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-sky-500/30 to-transparent"></div>
    </header>
`;

export { navbar };