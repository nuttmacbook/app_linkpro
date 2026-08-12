import { formNumber, shortAddress } from "../web3/connect";
import { joinQueue } from "./joinQueue";

// Swaps the visible position panel without re-rendering the page
if (typeof window !== "undefined") {
    window.selectPosition = (id) => {
        document.querySelectorAll("[data-pos-panel]").forEach((el) => {
            el.classList.toggle("hidden", el.dataset.posPanel !== String(id));
        });
        document.querySelectorAll("[data-pos-chip]").forEach((el) => {
            const active = el.dataset.posChip === String(id);
            el.setAttribute("aria-selected", active ? "true" : "false");
            el.classList.toggle("border-sky-400/60", active);
            el.classList.toggle("bg-sky-500/10", active);
            el.classList.toggle("text-sky-100", active);
            el.classList.toggle("border-white/10", !active);
            el.classList.toggle("text-slate-400", !active);
        });
    };
}

const STEPS = [
    { short: "In line",    title: "Waiting for payout",        tone: "text-sky-300",     dot: "bg-sky-400" },
    { short: "Paid",       title: "Paid, waiting to reinvest", tone: "text-emerald-300", dot: "bg-emerald-400" },
    { short: "Reinvested", title: "Reinvested, closed",        tone: "text-slate-300",   dot: "bg-slate-500" },
];

const dashboard = (data) => {
    const totalQueue = Number(data?.getDappInfo?.[1] ?? 0);
    const currentQueue = Number(data?.getDappInfo?.[2] ?? 0);

    const renderWallet = shortAddress(data?.wallet?.address);
    const fullWallet = data?.wallet?.address ?? "";

    const totalProfit = formNumber(data?.getUserInfo?.[0]?.totalProfit, 18, 2);

    const posIds = Array.isArray(data?.getUserInfo?.[0]?.pos)
        ? data.getUserInfo[0].pos.map(Number)
        : [];

    // getUserInfo returns (User, Position[]) — the second value carries each step
    const raw = Array.isArray(data?.getUserInfo?.[1]) ? data.getUserInfo[1] : [];
    const positions = posIds.map((id, i) => ({
        id,
        step: Math.min(2, Math.max(0, Number(raw[i]?.step ?? 0))),
        index: i,
    }));

    const hasPosition = positions.length > 0;
    const latest = hasPosition ? positions[positions.length - 1] : null;
    const waitingId = latest?.id ?? 0;
    const reinvested = Math.max(0, positions.length - 1);

    const queueGap = Math.max(0, waitingId - currentQueue);
    const progress = totalQueue > 0
        ? Math.min(100, (currentQueue / totalQueue) * 100)
        : 0;

    const sectionHeader = ({ icon, eyebrow, title }) => /*html*/`
        <header class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 ring-1 ring-inset ring-sky-400/30 sm:h-11 sm:w-11">
                <img src="${icon}" alt="" class="h-5 w-5 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)] sm:h-6 sm:w-6">
            </span>
            <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400/70 sm:text-[11px]">${eyebrow}</p>
                <h1 class="truncate text-base font-semibold leading-tight text-white sm:text-lg">${title}</h1>
            </div>
        </header>
    `;

    const row = ({ icon, label, value, tone = "text-slate-100" }) => /*html*/`
        <div class="group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-sky-500/[0.04] sm:gap-4 sm:px-5 sm:py-4">
            <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-500/10 ring-1 ring-inset ring-sky-400/20 transition-colors group-hover:bg-sky-500/20 sm:h-9 sm:w-9">
                    <img src="${icon}" alt="" class="h-3.5 w-3.5 opacity-90 sm:h-4 sm:w-4">
                </span>
                <span class="truncate text-[13px] font-medium text-slate-300 sm:text-sm">${label}</span>
            </div>
            <span class="shrink-0 font-mono text-[13px] font-semibold tabular-nums ${tone} sm:text-sm">${value}</span>
        </div>
    `;

    /* --------------------------------------------------- position browser */

    const detailRow = (label, value, tone = "text-slate-200") => /*html*/`
        <div class="flex items-center justify-between gap-3 py-2">
            <span class="text-[13px] text-slate-400">${label}</span>
            <span class="shrink-0 font-mono text-[13px] font-semibold tabular-nums ${tone}">${value}</span>
        </div>
    `;

    const panel = (p) => {
        const s = STEPS[p.step];
        const gap = Math.max(0, p.id - currentQueue);
        const origin = p.index === 0
            ? "First position"
            : `Reinvest of #${positions[p.index - 1].id}`;

        return /*html*/`
            <div data-pos-panel="${p.id}" class="${p.id === waitingId ? "" : "hidden "}px-4 py-5 sm:px-5">
                <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p class="font-mono text-sm font-semibold tabular-nums text-white">
                        Position <span class="text-sky-400/60">#</span>${p.id}
                    </p>
                    <p class="font-mono text-[11px] tabular-nums text-slate-500">Step ${p.step} of 2</p>
                </div>

                <ol class="mt-3.5 grid grid-cols-3 gap-2">
                    ${STEPS.map((_, i) => /*html*/`
                        <li class="flex min-w-0 flex-col gap-2">
                            <span class="h-1 rounded-full ${
                                i <= p.step
                                    ? "bg-gradient-to-r from-blue-600 to-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                                    : "bg-slate-800"
                            }"></span>
                            <span class="truncate text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                i === p.step ? "text-sky-300" : i < p.step ? "text-slate-400" : "text-slate-600"
                            }">${STEPS[i].short}</span>
                        </li>
                    `).join("")}
                </ol>

                <p class="mt-4 text-[13px] font-semibold ${s.tone}">${s.title}</p>

                <div class="mt-2 divide-y divide-white/5 border-t border-white/5 pt-1">
                    ${detailRow("Origin", origin, "text-slate-300")}
                    ${detailRow(
                        "Payout received",
                        p.step >= 1 ? "$16.00" : "—",
                        p.step >= 1 ? "text-emerald-300" : "text-slate-500"
                    )}
                    ${p.step === 0
                        ? detailRow("Positions ahead", `${gap}`, "text-sky-300")
                        : detailRow("Reinvested", p.step === 2 ? "Yes" : "Pending", p.step === 2 ? "text-slate-300" : "text-amber-300")}
                </div>
            </div>
        `;
    };

    const positionsSection = () => /*html*/`
        <div class="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 shadow-[0_20px_45px_-25px_rgba(2,6,23,0.95)] ring-1 ring-inset ring-sky-400/10 backdrop-blur">
            <div class="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-3.5 sm:px-5">
                <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">Your positions</p>
                <p class="font-mono text-[11px] tabular-nums text-slate-500">${positions.length} total</p>
            </div>

            <div role="tablist" aria-label="Your positions"
                 class="flex gap-2 overflow-x-auto border-b border-white/5 px-4 py-3 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden">
                ${[...positions].reverse().map((p) => {
                    const active = p.id === waitingId;
                    return /*html*/`
                        <button type="button" role="tab"
                                data-pos-chip="${p.id}"
                                aria-selected="${active}"
                                onclick="selectPosition('${p.id}')"
                                class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[12px] font-semibold tabular-nums outline-none transition focus-visible:ring-2 focus-visible:ring-sky-400/60 ${
                                    active
                                        ? "border-sky-400/60 bg-sky-500/10 text-sky-100"
                                        : "border-white/10 text-slate-400 hover:border-sky-400/30 hover:text-slate-200"
                                }">
                            <span class="h-1.5 w-1.5 shrink-0 rounded-full ${STEPS[p.step].dot}"></span>
                            #${p.id}
                        </button>
                    `;
                }).join("")}
            </div>

            ${positions.map(panel).join("")}
        </div>
    `;

    /* ---------------------------------------------------- account section */

    const accountSection = () => /*html*/`
        <section class="flex min-w-0 flex-col gap-3 sm:gap-4">
            ${sectionHeader({
                icon: "/account.svg",
                eyebrow: "Wallet",
                title: "Your information",
            })}

            <!-- Address -->
            <div class="flex flex-col gap-2.5 rounded-2xl border border-white/5 bg-slate-900/70 px-4 py-4 ring-1 ring-inset ring-sky-400/10 backdrop-blur xs:flex-row xs:items-center xs:justify-between xs:gap-4 sm:px-5">
                <div class="flex items-center gap-3">
                    <span class="relative flex h-2.5 w-2.5 shrink-0">
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-60 motion-reduce:animate-none"></span>
                        <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-400"></span>
                    </span>
                    <span class="text-[13px] font-medium text-slate-300 sm:text-sm">Account address</span>
                </div>
                <span title="${fullWallet}" class="self-start rounded-md bg-slate-950/60 px-2.5 py-1 font-mono text-[11px] font-semibold text-sky-300 ring-1 ring-inset ring-sky-400/20 xs:self-auto sm:text-xs">
                    ${renderWallet}
                </span>
            </div>

            <div class="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 shadow-[0_20px_45px_-25px_rgba(2,6,23,0.95)] ring-1 ring-inset ring-sky-400/10 backdrop-blur">

                <!-- Total profit -->
                <div class="border-b border-white/5 bg-gradient-to-br from-sky-500/[0.07] to-transparent px-4 py-5 sm:px-5 sm:py-6">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">Total profit</p>
                    <p class="mt-1 break-all font-mono text-3xl font-bold leading-none tabular-nums text-white sm:text-4xl">
                        <span class="text-sky-400/50">$</span>${totalProfit}
                    </p>
                </div>

                <div class="divide-y divide-white/5">
                    ${row({
                        icon: "/account_1.svg",
                        label: "Your total profit",
                        value: `$${totalProfit}`,
                        tone: "text-emerald-300",
                    })}
                    ${row({
                        icon: "/account_2.svg",
                        label: "Active queue ID",
                        value: `#${waitingId}`,
                        tone: "text-sky-300",
                    })}
                    ${row({
                        icon: "/account_3.svg",
                        label: "Reinvested",
                        value: `${reinvested}`,
                        tone: "text-slate-100",
                    })}
                </div>
            </div>

            ${positionsSection()}
        </section>
    `;

    return /*html*/`
    <div class="mx-auto mt-6 grid w-full max-w-6xl grid-cols-1 gap-5 px-4 sm:mt-8 sm:gap-6 sm:px-6 lg:grid-cols-2">

        <!-- ================= Global Queue ================= -->
        <section class="flex min-w-0 flex-col gap-3 sm:gap-4">
            ${sectionHeader({
                icon: "/dashboard.svg",
                eyebrow: "Network",
                title: "Global Queue",
            })}

            <div class="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70 shadow-[0_20px_45px_-25px_rgba(2,6,23,0.95)] ring-1 ring-inset ring-sky-400/10 backdrop-blur">

                <!-- Queue progress -->
                <div class="border-b border-white/5 bg-gradient-to-br from-sky-500/[0.07] to-transparent px-4 py-5 sm:px-5 sm:py-6">
                    <div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                        <div class="min-w-0">
                            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">Now serving</p>
                            <p class="mt-1 font-mono text-3xl font-bold leading-none tabular-nums text-white sm:text-4xl">
                                <span class="text-sky-400/50">#</span>${currentQueue}
                            </p>
                        </div>
                        <p class="font-mono text-xs tabular-nums text-slate-400 sm:text-sm">of #${totalQueue}</p>
                    </div>

                    <div class="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 sm:mt-5">
                        <div class="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.6)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                             style="width:${progress.toFixed(2)}%"></div>
                    </div>
                    <p class="mt-2 text-[11px] text-slate-500 sm:text-xs">${progress.toFixed(1)}% of the queue served</p>
                </div>

                <div class="divide-y divide-white/5">
                    ${row({
                        icon: "/dashboard_1.svg",
                        label: "Global total queue",
                        value: `#${totalQueue}`,
                        tone: "text-slate-100",
                    })}
                    ${row({
                        icon: "/dashboard_2.svg",
                        label: "Current now queue",
                        value: `#${currentQueue}`,
                        tone: "text-sky-300",
                    })}
                    ${row({
                        icon: "/dashboard_3.svg",
                        label: "Your next queue",
                        value: hasPosition ? `#${waitingId}` : "Not joined",
                        tone: hasPosition ? "text-cyan-300" : "text-slate-500",
                    })}
                </div>

                ${hasPosition ? /*html*/`
                    <div class="flex items-center justify-between gap-3 border-t border-white/5 bg-slate-950/40 px-4 py-3 sm:px-5">
                        <span class="text-[11px] text-slate-500 sm:text-xs">Positions ahead of you</span>
                        <span class="font-mono text-[11px] font-semibold tabular-nums text-slate-300 sm:text-xs">${queueGap}</span>
                    </div>
                ` : ""}
            </div>
        </section>

        <!-- ============ Account / Join, depending on state ============ -->
        ${hasPosition ? accountSection() : joinQueue(data)}
    </div>
  `;
};

export { dashboard };