const landing = (data) => {
    const isConnected = Boolean(data?.wallet?.address);

    return /*html*/`
    <section class="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 flex justify-center">
        <div class="flex max-w-2xl flex-col items-center gap-5 text-center">

            <span class="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/[0.07] px-3 py-1">
                <span class="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                <span class="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300 sm:text-[11px]">
                    Running on-chain
                </span>
            </span>

            <h1 class="text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-5xl">
                One queue, ordered by<br class="hidden sm:block">
                <span class="bg-gradient-to-r from-sky-300 to-blue-500 bg-clip-text text-transparent">smart contract</span>
            </h1>

            <p class="text-xs leading-relaxed text-slate-400">
                Every position is recorded in the order the blockchain confirms it. All rules live in the
                contract and anyone can read them. No intermediary can reorder the queue after the fact.
            </p>
        </div>
    </section>
  `;
};

export { landing };