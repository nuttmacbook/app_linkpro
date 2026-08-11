export const getAPI = async (path) => {
    try {
        const controller = new AbortController();
        const signal = controller.signal;
        const response = await fetch(path, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const callback = await response.json();
        return callback;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const postAPI = async (path, body) => {
    try {
        const safeBody = JSON.stringify(body, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        );

        const controller = new AbortController();
        const signal = controller.signal;
        const response = await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: safeBody,
            signal
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const callback = await response.json();
        return callback;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const copyLink = (ElementId) => {
    var element = document.getElementById(ElementId);
    var textNode = element.firstChild;
    const elem = document.createElement('textarea');
    elem.value = textNode.data || textNode.textContent;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
    alert("Copied!");
}

export const setCookie = (name, value, exdays) => {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 86400));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export const getCookie = (name) => {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return "";
}

export const saveData = (key, data) => {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
}

export const loadData = (key) => {
    try {
        const jsonData = localStorage.getItem(key);
        if (!jsonData) return undefined;
        return JSON.parse(jsonData);
    } catch (error) {
        console.error("Error loading data:", error);
        return undefined;
    }
}

export const fetchURLparams = (param) => {
    const queryString = window.location.search.substring(1);
    const urlParams = queryString.split('&');
    for (let i = 0; i < urlParams.length; i++) {
        const pair = urlParams[i].split('=');
        if (pair[0] === param) {
            return pair[1];
        }
    }
    return null;
}

export const updateValueFromURL = (primaryKey, exdays) => {
    const value = fetchURLparams(primaryKey);
    if (value!=null) { setCookie(primaryKey, value, exdays); }
}