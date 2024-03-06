let canInstallApp = false;
let deferredPrompt;

function getPlatform() {
    return navigator?.userAgentData?.platform || navigator?.platform || 'unknown'
}

function checkPWA() {
    return canInstallApp;
}

async function installApp() {
    if (deferredPrompt !== null) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            deferredPrompt = null;
        }
    }
}

//beforeinstallprompt will only be fired when some conditions are true :
//  The PWA must not already be installed
//  Meets a user engagement heuristic(previously, the user had to interact with the domain for at least 30 seconds, this is not a requirement anymore).
//  Your web app must include a web app manifest.
//  Your web app must be served over a secure HTTPS connection.
//  Has registered a service worker with a fetch event handler.
//  Does not works on iOS Safari (batards) ==> https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent#browser_compatibility

window.addEventListener('beforeinstallprompt', (e) => {
    //alert("beforeinstallprompt: " + e.platforms);

    console.log("platform: " + e.platforms); // e.g., ["web", "android", "windows"]

    // Prevent the mini-infobar from appearing on mobile
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    //e.preventDefault();

    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    canInstallApp = true;

    console.log("--------------------beforeinstallprompt event was fired");
});

//console.log("pwa.js loaded");