import { box, delay } from "../connect";
import { LinkPro } from "../contracts/contract_linkpro";
import { Tether } from "../contracts/contract_tether";

export async function createPosition(wallet) {
    const account = wallet?.address ?? box.ZERO;
    const signer = wallet?.signer;

    const amount = BigInt(20e18);
    const isApproved = await box.isTokenApproval(Tether, account, LinkPro.address, amount, box.getCurrentRpc());
    console.log({ isApproved });

    if (!isApproved) {
        try {
            const token = box.createEtherContract(Tether, signer);
            const tx = await token.approve(LinkPro.address, amount);
            await tx.wait();
        } catch (error) {
            throw new Error("Approval Failed, Try Again!");
        }
    }

    try {
        const engine = box.createEtherContract(LinkPro, signer);
        const tx = await engine.createPosition(account);
        await tx.wait();
        await delay(5000);
        window.location.reload();
        return true;
    } catch (error) {
        const handleTxError = box.handleTxError(LinkPro, error);
        const errorContext = handleTxError?.raw?.shortMessage || error;
        throw new Error(errorContext);
    }
}
