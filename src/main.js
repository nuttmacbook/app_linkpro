import './main.css';

import { box } from './web3/connect';
import { navbar } from './componants/navbar';
import { title } from './componants/title';

import { LinkPro } from './web3/contracts/contract_linkpro';
import { createPosition } from './web3/intereacts/createPosition';

box.safeRenderApp(renderApp);

window.createPosition = async () => {
    return createPosition(await box.getCurrentState());
}

async function getContractData(wallet) {
    const account = wallet?.address ?? box.ZERO;
    const engine = box.createWeb3Contract(LinkPro, box.getCurrentRpc());

    const [ getDappInfo, getUserInfo ] = await Promise.all([
        engine.methods.getDappInfo().call(),
        engine.methods.getUserInfo(account).call()
    ]);

    console.log({ account, getDappInfo, getUserInfo });
}

async function renderApp(wallet) {
    console.log({ wallet });
    const path = window.location.pathname;
    if (path === "/") {
        const app = document.querySelector('#app');
        app.innerHTML = /*html*/`
            ${navbar}
        `;

        await getContractData(wallet);
    }
}