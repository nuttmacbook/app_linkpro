import './main.css';

import { box } from './web3/connect';
import { navbar } from './componants/navbar';

box.safeRenderApp(renderApp);

async function renderApp(wallet) {
    console.log({ wallet });
    const path = window.location.pathname;
    if (path === "/") {
        const app = document.querySelector('#app');
        app.innerHTML = /*html*/`
            ${navbar}
            <button id="installBtn" class="bg-blue-300 p-3 rounded text-white">Install App</button>
        `;
        settingPWA();
    }
}

async function settingPWA() {
    const installBtn = document.getElementById('installBtn');

    installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
    }
    });
}