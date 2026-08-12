const steps = [
    {
        no: "01",
        title: "Connect wallet",
        desc: "Connect from the button in the top right. The app reads straight from the contract and never stores your private key.",
    },
    {
        no: "02",
        title: "Create position",
        desc: "Send one transaction to claim a queue number. Your place is written on-chain in the order the block confirms it.",
    },
    {
        no: "03",
        title: "Track your queue",
        desc: "Watch the current queue and your own position on the dashboard. Figures refresh from contract state on every load.",
    },
];

const stepCard = ({ no, title, desc }) => /*html*/`
    <li class="flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-900/40 p-5 ring-1 ring-inset ring-sky-400/10 transition-colors hover:ring-sky-400/25">
        <span class="font-mono text-xs font-bold tabular-nums tracking-[0.2em] text-sky-400/60">${no}</span>
        <h3 class="text-sm font-semibold text-white sm:text-base">${title}</h3>
        <p class="text-[13px] leading-relaxed text-slate-400">${desc}</p>
    </li>
`;

const howItWorks = /*html*/`
    <section id="how-it-works" class="mx-auto w-full max-w-6xl scroll-mt-8 px-4 pt-12 sm:px-6 sm:pt-16">
        <div class="flex items-center gap-3">
            <h2 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">How it works</h2>
            <span class="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
        </div>

        <ol class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            ${steps.map(stepCard).join("")}
        </ol>
    </section>
`;

export { howItWorks };