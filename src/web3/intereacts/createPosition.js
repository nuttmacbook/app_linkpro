import { box } from "../connect";
import { LinkPro } from "../contracts/contract_linkpro";
import { Tether } from "../contracts/contract_tether";

// Position price. Tether is 18 decimals on BSC — use 6 decimals on Ethereum/Tron.
const AMOUNT = 20n * 10n ** 18n;

/**
 * Creates a position, approving the token first when needed.
 *
 * @param {object} wallet  current wallet state
 * @param {object} options
 * @param {(step: {stage: string, index: number, total: number}) => void} options.onStep
 *        called before each wallet prompt so the UI can say what is being signed
 * @returns {Promise<object>} the transaction receipt of createPosition
 */
export async function createPosition(wallet, { onStep = () => {} } = {}) {
    const account = wallet?.address ?? box.ZERO;
    const signer = wallet?.signer;

    if (!account || account === box.ZERO || !signer) {
        throw new Error("Wallet is not connected.");
    }

    onStep({ stage: "checking", index: 0, total: 1 });

    const isApproved = await box.isTokenApproval(
        Tether, account, LinkPro.address, AMOUNT, box.getCurrentRpc()
    );

    // Two wallet prompts when approval is still needed, one when it is not
    const total = isApproved ? 1 : 2;

    // Fail before any signature if the balance cannot cover it
    try {
        const token = box.createEtherContract(Tether, signer);
        const balance = await token.balanceOf(account);
        if (BigInt(balance) < AMOUNT) {
            throw new Error("Not enough USDT in your wallet to create a position.");
        }
    } catch (error) {
        if (/Not enough USDT/.test(error?.message)) throw error;
        // balanceOf unavailable — let the contract decide instead of blocking here
    }

    if (!isApproved) {
        onStep({ stage: "approve", index: 1, total });
        try {
            const token = box.createEtherContract(Tether, signer);
            const tx = await token.approve(LinkPro.address, AMOUNT);
            onStep({ stage: "approving", index: 1, total });
            await tx.wait();
        } catch (error) {
            const handled = box.handleTxError(Tether, error);
            throw normalize(error, handled, "Approval failed. Please try again.");
        }
    }

    onStep({ stage: "create", index: total, total });
    try {
        const engine = box.createEtherContract(LinkPro, signer);
        const tx = await engine.createPosition(account);
        onStep({ stage: "creating", index: total, total });

        // Return the receipt so the caller can show the hash and read the new queue id
        return await tx.wait();
    } catch (error) {
        const handled = box.handleTxError(LinkPro, error);
        throw normalize(error, handled, "The transaction did not go through.");
    }
}

/** Keeps the wallet's own error code so the UI can tell a rejection from a failure */
function normalize(error, handled, fallback) {
    const message = handled?.raw?.shortMessage || error?.shortMessage || error?.message || fallback;
    const out = new Error(message);
    out.code = error?.code;
    out.cause = error;
    return out;
}