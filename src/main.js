import './main.css';

import { box } from './web3/connect';
import { navbar } from './componants/navbar';
import { title } from './componants/title';

box.safeRenderApp(renderApp);

async function renderApp(wallet) {
    console.log({ wallet });
    const path = window.location.pathname;
    if (path === "/") {
        const app = document.querySelector('#app');
        app.innerHTML = /*html*/`
            ${navbar}
        `;
    }
}