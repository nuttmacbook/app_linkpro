// Block explorer base URL — change this to match the chain you deploy on
const EXPLORER_TX = "https://bscscan.com/tx/";

let root = null;
let dismissible = false;
let onDismiss = null;

const ensureRoot = () => {
    if (root && document.body.contains(root)) return root;
    root = document.createElement("div");
    root.id = "notify-root";
    document.body.appendChild(root);
    return root;
};

const close = () => {
    if (!dismissible) return;
    if (root) root.innerHTML = "";
    document.removeEventListener("keydown", onKeydown);
    const cb = onDismiss;
    onDismiss = null;
    if (typeof cb === "function") cb();
};

const onKeydown = (e) => {
    if (e.key === "Escape") close();
};

const shell = (body) => /*html*/`
    <div class="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm sm:items-center"
         role="dialog" aria-modal="true" aria-labelledby="notify-title"
         data-backdrop>
        <div class="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-[0_30px_60px_-20px_rgba(2,6,23,0.9)] ring-1 ring-inset ring-sky-400/10">
            ${body}
        </div>
    </div>
`;

const paint = (body, { canDismiss, after }) => {
    dismissible = canDismiss;
    onDismiss = after ?? null;

    const host = ensureRoot();
    host.innerHTML = shell(body);

    const backdrop = host.querySelector("[data-backdrop]");
    if (backdrop) {
        backdrop.addEventListener("mousedown", (e) => {
            if (e.target === backdrop) close();
        });
    }

    document.removeEventListener("keydown", onKeydown);
    if (canDismiss) document.addEventListener("keydown", onKeydown);

    host.querySelector("[data-autofocus]")?.focus();
};

/* ---------------------------------------------------------------- pending */

const copy = {
    checking: {
        title: "Checking your wallet",
        desc: "Reading your balance and allowance from the contract.",
    },
    approve: {
        title: "Approve USDT",
        desc: "Your wallet is asking permission to spend 20 USDT. Nothing moves yet — this only sets the allowance.",
    },
    approving: {
        title: "Confirming approval",
        desc: "Waiting for the network to confirm the allowance. Keep this tab open.",
    },
    create: {
        title: "Confirm your position",
        desc: "This is the transaction that joins the queue. Once confirmed it cannot be reversed.",
    },
    creating: {
        title: "Joining the queue",
        desc: "Waiting for the network to confirm. Keep this tab open until it finishes.",
    },
};

const pending = (step = {}) => {
    const { title, desc } = copy[step.stage] ?? copy.creating;
    const showSteps = step.total > 1 && step.index > 0;

    paint(/*html*/`
        <div class="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <span class="h-10 w-10 animate-spin rounded-full border-2 border-sky-500/20 border-t-sky-400 motion-reduce:animate-none"></span>
            <div>
                ${showSteps ? `
                    <p class="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400/70">
                        Step ${step.index} of ${step.total}
                    </p>
                ` : ""}
                <h2 id="notify-title" class="text-base font-semibold text-white">${title}</h2>
                <p class="mt-1.5 text-[13px] leading-relaxed text-slate-400">${desc}</p>
            </div>
        </div>
    `, { canDismiss: false });
};

/* ---------------------------------------------------------------- success */

const success = ({ hash, queueId } = {}) => {
    paint(/*html*/`
    <div class="flex flex-col items-center gap-4 px-6 py-8 text-center">
        <span class="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-inset ring-emerald-400/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-emerald-400">
                <path d="M20 6 9 17l-5-5"/>
            </svg>
        </span>

        <div>
            <h2 id="notify-title" class="text-base font-semibold text-white">Position created</h2>
            <p class="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                ${queueId
                    ? `Your queue number is <strong class="font-mono font-semibold text-sky-300">#${queueId}</strong>. The dashboard has been updated.`
                    : "Your position is now recorded on-chain. The dashboard has been updated."}
            </p>
        </div>

        ${hash ? /*html*/`
            <a href="${EXPLORER_TX}${hash}" target="_blank" rel="noopener noreferrer"
               class="max-w-full truncate rounded-lg bg-slate-950/60 px-3 py-1.5 font-mono text-[11px] text-sky-300 ring-1 ring-inset ring-sky-400/20 transition-colors hover:text-sky-200">
                ${hash.slice(0, 10)}…${hash.slice(-8)}
            </a>
        ` : ""}

        <button type="button" data-autofocus data-close
                class="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-sm font-semibold text-white outline-none transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-sky-300 active:scale-[0.98] motion-reduce:active:scale-100">
            View dashboard
        </button>
    </div>
    `, { canDismiss: true });
    bindClose();
};

/* ------------------------------------------------------------------ error */

const readableError = (err) => {
    const code = err?.code;
    const msg = String(err?.shortMessage || err?.message || err || "");

    if (code === 4001 || code === "ACTION_REJECTED" || /user (rejected|denied)/i.test(msg)) {
        return "You rejected the request in your wallet. Nothing was sent and no position was created.";
    }
    if (/insufficient funds/i.test(msg)) {
        return "Your wallet does not have enough balance to cover the amount plus gas.";
    }
    const reverted = msg.match(/revert(?:ed)?(?: with reason string)?:?\s*['"]?([^'"\n]{3,120})/i);
    if (reverted) {
        return `The contract rejected the transaction: ${reverted[1].trim()}`;
    }
    if (/network|timeout|failed to fetch/i.test(msg)) {
        return "Could not reach the network. Check your connection and try again.";
    }
    return msg.slice(0, 200) || "The transaction did not go through. Please try again.";
};

const error = (err) => {
    paint(/*html*/`
        <div class="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <span class="grid h-12 w-12 place-items-center rounded-full bg-rose-500/10 ring-1 ring-inset ring-rose-400/30">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-rose-400">
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            </span>

            <div>
                <h2 id="notify-title" class="text-base font-semibold text-white">Position not created</h2>
                <p class="mt-1.5 break-words text-[13px] leading-relaxed text-slate-400">${readableError(err)}</p>
            </div>

            <button type="button" data-autofocus data-close
                    class="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-slate-200 outline-none transition hover:border-sky-400/40 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400/60">
                Close
            </button>
        </div>
    `, { canDismiss: true });
    bindClose();
};

function bindClose() {
    root?.querySelector("[data-close]")?.addEventListener("click", close);
}

const notify = { pending, success, error, close };

export { notify };