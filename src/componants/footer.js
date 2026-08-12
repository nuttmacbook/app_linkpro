const footer = /*html*/`
    <footer class="mt-16 w-full sm:mt-20">
        <div class="mx-auto h-px w-full max-w-6xl bg-gradient-to-r from-transparent via-sky-500/20 to-transparent"></div>

        <div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

                <!-- Brand -->
                <div class="flex max-w-sm flex-col gap-3">
                    <div class="flex items-center gap-2.5">
                        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/10 ring-1 ring-inset ring-sky-400/30">
                            <img src="logo.png" alt="" class="h-5 w-5">
                        </span>
                        <strong class="text-base font-extrabold uppercase italic leading-none tracking-tight text-white">
                            link<span class="text-sky-400">pro</span>
                        </strong>
                    </div>
                </div>

                <!-- Links -->
                <nav class="flex flex-col gap-3">
                <p class="max-w-3xl text-xs leading-relaxed text-slate-500">
                    Blockchain transactions cannot be reversed, and crypto asset prices move sharply.
                    Returns depend on how many people join the queue after you, which nobody can guarantee.
                    Read the contract code and weigh the risk yourself before creating a position.
                </p>
                <p class="font-mono text-[11px] tabular-nums text-slate-600">
                    &copy; ${new Date().getFullYear()} LinkPro
                </p>
                </nav>
            </div>
        </div>
    </footer>
`;

export { footer };