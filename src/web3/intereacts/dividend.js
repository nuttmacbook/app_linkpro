import { box } from "../connect";
import { LinkPro } from "../contracts/contract_linkpro";
import { Tether } from "../contracts/contract_tether";

const participants = [
    "0xb4350dc2338a34103e3d25247664db1cb2555854",
    "0x54790473e9c96108e299a546ea60e7a2dac7d735",
    "0x47785e2203e6cbaa4138b3daeee861dd09d593f1",
    "0x980fbc13db15c07bc39c827fb68411f610a0f7c8",
    "0x4fa3e0cd3e983db10c74a0cb747f9ceab97e6d86",
    "0x861047204aA77Aad44b71ea79254e3e1745856Cc",
    "0xb528c6467712Fb231fC1BA2513CF8Ce6bf61eDD8",
    "0x34356d9056CbB7319D15cedC8996CE7afe34040B",
    "0x56076165a70ecC6EDd44F4796aEdFFfB91629429",
    "0x621e29d96b9745a6651145Db504eFc0A22E3000E",
    "0xd417C1047dE24664E9641f28906E04541C85fCa9",
    "0xD3b148bEA650dDf50d935ba083b5E0E8473e03Af",
    "0x2Ad0FaB2bdEE5ac96cE36152b8F9e269b0999a71",
    "0x6193a1A722f9552F670afe6F3af393C97A8Ec2C8",
    "0x33fFec3d0537FE05DE9fD077Abe06739fda66370",
    "0xAF3A6E8bE63176698B1e1132c751c40Ca329F682",
    "0x1A9F4f7F6367F97b61c29189d15bF47D8a162f7a",
    "0x29eCBB1bfE97b491b64552Ff0a20F1B2Caefedcc",
    "0xC6925dfcDE76D80d6482fe66016970B39Ce231e1",
    "0xD124045AcBCd0D10708f7Add0abCdbCc851FD36a",
    "0xE2e7749C67c78dD5823D1505fBaF92bB1CdaB94E",
    "0xEd892813a1ac52b53c55acd5de7DBAF7710F312F",
    "0x04aFCb702c24bFFd0FEE3676BD6C918c13F0f098",
    "0x0Ee4911a068CD78fD7022303fF98dceCdA4eEA44",
    "0xe17Ba1fCa20574eB1C53d1C4EC4B01688Bdd286C",
    "0x4A846f58f1DCAeC755707Eb670c4e73A47e05620",
    "0x68dc8d79a8fD2F920aE7086DB8B8680d4aD0eBf6",
    "0x65eb5d4dBB1c67Ce3D01BEfdAD75B38A66E8D3E0",
    "0x558886FdE217Ef1ce8BE9564c00F8397C76ba5e0",
    "0x214f20b127160A63dE8B6BEA7816997B1Aa77CAe",
    "0xC27d0d7765d379c5acA23f291406Eb53A89Adb9d",
    "0x48b15C406cbb7CA3c1E915ecd404F8D86191a1de",
    "0x77a46ac1d2A42D02E2B087D8919B25A547e56241",
    "0x60671fa1EC61CFb25a5e5659B7a0b65236FE8c29",
    "0x38568eA38202ee03EE0b47E2F2C46A09b1DB2A4A",
    "0xD3A1Db41458022Dc5B7cFaaf570b41c0BA67ECa0",
    "0x84D93Da6AD5DD9398142Ba381961F700D3dECE18",
    "0x0a1ACcDF6a7fAA465426e15E0634076aFB67df1a",
    "0x6EfbA02fd361Ff9dB3Ba85B65ec2779060171eB8",
    "0xB22700de4C16A064Aa1F3CD43f7F6Da0a937aF04"
]

export async function dividend(wallet, amount, { onStep = () => {} } = {}) {
    const account = wallet?.address ?? box.ZERO;
    const signer = wallet?.signer;

    const AMOUNT = amount * 10n ** 18n;

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
            throw new Error("Not enough USDT in your wallet to send dividend.");
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
        const tx = await engine.dividend(participants, AMOUNT);
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