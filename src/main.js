import './main.css';

import { box } from './web3/connect';
import { navbar } from './componants/navbar';

import { LinkPro } from './web3/contracts/contract_linkpro';
import { createPosition } from './web3/intereacts/createPosition';

import { landing } from './componants/landing';
import { dashboard } from './componants/dashboard';
import { howItWorks } from './componants/howItWorks';
import { footer } from './componants/footer';
import { notify } from './componants/notify';

box.safeRenderApp(renderApp);

window.createPosition = async () => {
    const wallet = await box.getCurrentState();
    const before = countPositions(await safeRead(wallet));

    try {
        notify.pending({ stage: "checking" });
        const receipt = await createPosition(wallet, { onStep: notify.pending });

        // Read nodes can lag a block behind the receipt, so wait for the count to move
        const data = await readUntilUpdated(wallet, before);
        paint(data);

        const pos = positionsOf(data);
        notify.success({
            hash: receipt?.transactionHash ?? receipt?.hash,
            queueId: pos.length ? pos[pos.length - 1] : null,
        });
    } catch (err) {
        console.error(err);
        notify.error(err);
    }
};

const positionsOf = (data) =>
    Array.isArray(data?.getUserInfo?.[0]?.pos) ? data.getUserInfo[0].pos : [];

const countPositions = (data) => positionsOf(data).length;

async function safeRead(wallet) {
    try {
        return await getContractData(wallet);
    } catch {
        return null;
    }
}

/** Polls contract state until the new position appears, then gives up gracefully */
async function readUntilUpdated(wallet, before, tries = 5) {
    let data = null;
    for (let i = 0; i < tries; i++) {
        data = await safeRead(wallet);
        if (data && countPositions(data) > before) return data;
        await new Promise((r) => setTimeout(r, 1500));
    }
    return data ?? await getContractData(wallet);
}

async function getContractData(wallet) {
    const account = wallet?.address ?? box.ZERO;
    const engine = box.createWeb3Contract(LinkPro, box.getCurrentRpc());

    const [ getDappInfo, getUserInfo ] = await Promise.all([
        engine.methods.getDappInfo().call(),
        engine.methods.getUserInfo(account).call()
    ]);

    return { wallet, account, getDappInfo, getUserInfo }
}

function paint(data) {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = /*html*/`
        ${navbar}
        ${landing(data)}
        ${dashboard(data)}
        ${howItWorks}
        ${footer}
    `;
}

async function renderApp(wallet) {
    const path = window.location.pathname;
    if (path !== "/") return;

    const data = await getContractData(wallet);
    paint(data);
}