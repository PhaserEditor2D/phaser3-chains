namespace Chains {


    export interface IPage {
        themeChanged();
        activate();
        resize(width: number, height: number): void;
        performQuery(query: string): void;
    }

    export interface IPanel {
        toggleVisibility();
    }

    const LIGHT_THEME = {
        name: "light",
        selectionHover: "#00000011",
        chainArgsColor: "black",
        chainDeclTypeColor: "#071683",
        chainRetTypeColor: "#20658a",
        chainVerColor: "rgba(40, 90, 0, 0.5)",
        exampleFileColor: "#008800",
        exampleLineColor: "#880088"
    }

    const DARK_THEME = {
        name: "dark",
        selectionHover: "#ffffff11",
        chainArgsColor: "silver",
        chainDeclTypeColor: "#09cc93",
        chainRetTypeColor: "#5198ad",
        chainVerColor: "rgb(40, 90, 0)",
        exampleFileColor: "#33cc33",
        exampleLineColor: "#dd44dd"
    }

    const THEME = {
        light: LIGHT_THEME,
        dark: DARK_THEME
    }

    class UI {
        private _queryElement: HTMLInputElement;

        private _icons: Map<string, HTMLImageElement> = new Map();
        private _theme = DARK_THEME;
        private _activePage: IPage;
        private _pages: IPage[];
        private _docsPanel: DocsPanel;
        private _examplePanel: ExamplePanel;
        private _pageCanvas: HTMLCanvasElement;
        private _footerElement: HTMLElement;
        currentPanel: IPanel;
        private _themeBtn: HTMLAnchorElement;

        preload() {
            for (let name of ["property", "method", "field", "enum", "constant", "class", "package_obj", "event", "function"]) {
                this._icons[name] = this.loadIcon(name);
            }
        }

        getTheme() {
            return this._theme;
        }

        private updateThemeButton() {
            this._themeBtn.innerHTML = this.isDarkTheme() ? "Light" : "Dark";
        }

        swapTheme() {
            let html = document.getElementsByTagName("html")[0];
            html.classList.value = "";

            if (this._theme === LIGHT_THEME) {
                this._theme = DARK_THEME;
            } else {
                this._theme = LIGHT_THEME;
            }

            html.classList.value = "theme-" + this._theme.name;
            this._activePage.themeChanged();

            localStorage.chainsTheme = this._theme.name;

            this.updateThemeButton();
        }

        getDocsPanel() {
            return this._docsPanel;
        }

        getExamplePanel() {
            return this._examplePanel;
        }

        setQuery(query: string, performQuery = false) {
            this._queryElement.value = query;
            if (performQuery) {
                this.performQuery(query);
            }
        }

        getIcon(name: string) {
            return this._icons[name];
        }

        isDarkTheme() {
            return this._theme === DARK_THEME;
        }

        init() {

            const self = this;


            // theme

            {

                let name = localStorage.chainsTheme;
                if (name) {
                    let theme = THEME[name];
                    this._theme = theme || this._theme;
                }

                let html = document.getElementsByTagName("html")[0];
                html.classList.add("theme-" + this._theme.name);

                this._themeBtn = <HTMLAnchorElement>document.getElementById("themeBtn");
                this.updateThemeButton();
            }

            // phaser version
            {
                document.querySelectorAll(".phaserVer").forEach(e => {
                    e.innerHTML = "Phaser v" + Chains.PHASER_VERSION;
                });
            }

            // highlight css

            {
                let elem = document.createElement("link");
                elem.setAttribute("rel", "stylesheet");
                elem.setAttribute("type", "text/css");
                elem.setAttribute("media", "screen");
                elem.setAttribute("href", `lib/highlight/${this._theme.name}.css`);
                document.getElementsByTagName("body")[0].appendChild(elem);
            }


            // get elements

            this._queryElement = <HTMLInputElement>document.getElementById("query");
            this._queryElement.addEventListener("input", (e: TextEvent) => {
                this.performQuery(this._queryElement.value);
            });
            this._footerElement = document.getElementsByTagName("footer")[0];

            this._pageCanvas = <HTMLCanvasElement>document.getElementById("pageCanvas");

            // pages and panels

            this.initPanels();
            this.initPages();

            // resize

            this.resize();

            window.addEventListener("resize", () => self.resize());

            // key events

            window.addEventListener("keydown", e => self.keyDown(e));
        }



        private initPanels() {
            this._docsPanel = new DocsPanel();
            this._examplePanel = new ExamplePanel();
        }

        private initPages() {
            <HTMLCanvasElement>document.getElementById("pageCanvas");
            this._pages = [new ChainsPage(this._pageCanvas)];

            this._activePage = this._pages[0];
            this._activePage.activate();
        }

        loadIcon(src: string) {
            var img = document.createElement("img");
            img.src = "icons/" + src + ".png";
            img.style.width = "16px";
            return img;
        }

        resize() {
            const width = window.innerWidth;
            const height = window.innerHeight;

            {
                let h = window.innerHeight - this._queryElement.offsetHeight - 60 - this._footerElement.offsetHeight;
                this._pageCanvas.style.width = width + "px";
                this._pageCanvas.width = width;
                this._pageCanvas.style.height = h + "px";
                this._pageCanvas.height = h;
            }

            this._activePage.resize(width, height);
            this._docsPanel.resize(width, height);
        }

        keyDown(e: KeyboardEvent) {
            if (e.keyCode === 27) {
                if (this.currentPanel) {
                    this.currentPanel.toggleVisibility();
                }
            }
        }

        private performQuery(query: string) {
            this._activePage.performQuery(query);
        }

    }

    export const ui = new UI();
}