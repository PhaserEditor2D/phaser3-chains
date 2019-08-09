Chains.ui.preload();


async function load() {
    console.log("Booting Phaser Chains");
    await Chains.store.init();
    Chains.ui.init();
}

window.addEventListener("load", load);