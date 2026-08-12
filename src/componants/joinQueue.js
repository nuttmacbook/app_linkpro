const terms = [
    {
        title: "You are paid only when the queue reaches your number",
        body: "Creating a position does not pay out on its own. The contract releases funds to a position only once the queue has advanced to it. Until then you receive nothing.",
    },
    {
        title: "There is no guarantee the queue reaches you, or when",
        body: "The queue only moves forward as new participants join. If nobody joins after you, the queue stops and your position is never reached. No date, rate, or outcome is promised by the contract or by anyone operating it.",
    },
    {
        title: "The transaction cannot be reversed or cancelled",
        body: "Once your transaction is confirmed on-chain, the position is permanent. It cannot be undone, cancelled, or refunded by you, by the team, or by anyone else.",
    },
];

const joinQueue = (data) => {
    const isConnected = Boolean(data?.wallet?.address);
    const totalQueue = Number(data?.getDappInfo?.[1] ?? 0);
    const currentQueue = Number(data?.getDappInfo?.[2] ?? 0);

    // The next number the contract hands out, and how many turns sit in front of it
    const projectedId = totalQueue + 1;
    const positionsAhead = Math.max(0, projectedId - currentQueue);

    return /*html*/`
    <section class="flex min-w-0 flex-col gap-3 sm:gap-4">
        <header class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 ring-1 ring-inset ring-sky-400/30 sm:h-11 sm:w-11">
                <img src="/account.svg" alt="" class="h-5 w-5 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] sm:h-6 sm:w-6">
            </span>
            <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400/70 sm:text-[11px]">Get started</p>
                <h1 class="truncate text-base font-semibold leading-tight text-white sm:text-lg">Join the queue</h1>
            </div>
        </header>

        <div class="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 shadow-[0_20px_45px_-25px_rgba(2,6,23,0.95)] ring-1 ring-inset ring-sky-400/10 backdrop-blur">

            <!-- What you would get -->
            <div class="border-b border-white/5 bg-gradient-to-br from-sky-500/[0.07] to-transparent px-4 py-5 sm:px-5 sm:py-6">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">You would be assigned</p>
                <p class="mt-1 font-mono text-3xl font-bold leading-none tabular-nums text-white sm:text-4xl">
                    <span class="text-sky-400/50">#</span>${projectedId}
                </p>

                <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/5 pt-4">
                    <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Now serving</p>
                        <p class="mt-0.5 font-mono text-sm font-semibold tabular-nums text-sky-300">#${currentQueue}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Positions ahead</p>
                        <p class="mt-0.5 font-mono text-sm font-semibold tabular-nums text-slate-100">${positionsAhead}</p>
                    </div>
                </div>

                <p class="mt-3 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                    Based on queue state at the moment this page loaded. If someone joins before your
                    transaction confirms, your number moves back accordingly.
                </p>
            </div>

            <!-- Agreement -->
            <div class="px-4 py-5 sm:px-5">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">Before you continue</p>

                <ul class="mt-3 flex flex-col gap-3.5">
                    ${terms.map(({ title, body }, i) => /*html*/`
                        <li class="flex gap-3">
                            <span class="mt-0.5 font-mono text-[11px] font-bold tabular-nums text-sky-400/60">${String(i + 1).padStart(2, "0")}</span>
                            <div class="min-w-0">
                                <p class="text-[13px] font-semibold leading-snug text-slate-200">${title}</p>
                                <p class="mt-1 text-[13px] leading-relaxed text-slate-400">${body}</p>
                            </div>
                        </li>
                    `).join("")}
                </ul>

                <label for="queue-agreement"
                       class="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-slate-950/40 p-3.5 transition-colors hover:border-sky-400/25">
                    <input type="checkbox"
                           id="queue-agreement"
                           ${isConnected ? "" : "disabled"}
                           onchange="document.getElementById('create-position').disabled = !this.checked"
                           class="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-white/20 bg-slate-900 text-sky-500 accent-sky-500 outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 disabled:cursor-not-allowed">
                    <span class="text-[13px] leading-relaxed text-slate-300">
                        I have read all three points above. I understand my position may never be reached,
                        that nothing is guaranteed, and that this transaction cannot be reversed.
                    </span>
                </label>

                <button type="button"
                        id="create-position"
                        onclick="createPosition()"
                        disabled
                        class="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(56,189,248,0.8)] outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-sky-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100">
                    ${isConnected ? `Create position #${projectedId}` : "Connect wallet to continue"}
                </button>

                ${isConnected ? "" : /*html*/`
                    <p class="mt-2.5 text-center text-[11px] text-slate-500">
                        Connect your wallet from the button in the top right to join.
                    </p>
                `}
            </div>
        </div>
    </section>
  `;
};

export { joinQueue };