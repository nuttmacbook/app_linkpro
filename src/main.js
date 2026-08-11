import './main.css';
import { box } from './web3/connect';

box.safeRenderApp(renderApp);

async function renderApp(wallet) {
    console.log({ wallet });
    const path = window.location.pathname;
    if (path === "/") {
        const app = document.querySelector('#app');
        app.innerHTML = /*html*/`
            <img src="/logo.png" alt="Kitbox Logo" class="mx-auto w-32 h-32 mb-4" />
            <h1 class="text-7xl font-bold">Welcome To Kitbox</h1>
            <h2 class="text-xl text-gray-400 mt-4">Contact: Nuttweb3@gmail.com</h2>
            <br>
            <appKit-button class="my-4 mx-auto"></appKit-button>
            <a class="text-sm text-blue-500" href="https://www.npmjs.com/package/kitbox">NPM Package: Click Here</a>
        `;
    }
}