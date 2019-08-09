var Chains;
(function (Chains) {
    var LIGHT_THEME = {
        name: "light",
        selectionHover: "#00000011",
        chainArgsColor: "black",
        chainDeclTypeColor: "#071683",
        chainRetTypeColor: "#20658a",
        chainVerColor: "rgba(40, 90, 0, 0.5)",
        exampleFileColor: "#008800",
        exampleLineColor: "#880088"
    };
    var DARK_THEME = {
        name: "dark",
        selectionHover: "#ffffff11",
        chainArgsColor: "silver",
        chainDeclTypeColor: "#09cc93",
        chainRetTypeColor: "#5198ad",
        chainVerColor: "rgb(40, 90, 0)",
        exampleFileColor: "#33cc33",
        exampleLineColor: "#dd44dd"
    };
    var THEME = {
        light: LIGHT_THEME,
        dark: DARK_THEME
    };
    var UI = (function () {
        function UI() {
            this._icons = new Map();
            this._theme = DARK_THEME;
        }
        UI.prototype.preload = function () {
            for (var _i = 0, _a = ["property", "method", "field", "enum", "constant", "class", "package_obj", "event", "function"]; _i < _a.length; _i++) {
                var name_1 = _a[_i];
                this._icons[name_1] = this.loadIcon(name_1);
            }
        };
        UI.prototype.getTheme = function () {
            return this._theme;
        };
        UI.prototype.updateThemeButton = function () {
            this._themeBtn.innerHTML = this.isDarkTheme() ? "Light" : "Dark";
        };
        UI.prototype.swapTheme = function () {
            var html = document.getElementsByTagName("html")[0];
            html.classList.value = "";
            if (this._theme === LIGHT_THEME) {
                this._theme = DARK_THEME;
            }
            else {
                this._theme = LIGHT_THEME;
            }
            html.classList.value = "theme-" + this._theme.name;
            this._activePage.themeChanged();
            localStorage.chainsTheme = this._theme.name;
            this.updateThemeButton();
        };
        UI.prototype.getDocsPanel = function () {
            return this._docsPanel;
        };
        UI.prototype.getExamplePanel = function () {
            return this._examplePanel;
        };
        UI.prototype.setQuery = function (query, performQuery) {
            if (performQuery === void 0) { performQuery = false; }
            this._queryElement.value = query;
            if (performQuery) {
                this.performQuery(query);
            }
        };
        UI.prototype.getIcon = function (name) {
            return this._icons[name];
        };
        UI.prototype.isDarkTheme = function () {
            return this._theme === DARK_THEME;
        };
        UI.prototype.init = function () {
            var _this = this;
            var self = this;
            {
                var name_2 = localStorage.chainsTheme;
                if (name_2) {
                    var theme = THEME[name_2];
                    this._theme = theme || this._theme;
                }
                var html = document.getElementsByTagName("html")[0];
                html.classList.add("theme-" + this._theme.name);
                this._themeBtn = document.getElementById("themeBtn");
                this.updateThemeButton();
            }
            {
                document.querySelectorAll(".phaserVer").forEach(function (e) {
                    e.innerHTML = "Phaser v" + Chains.PHASER_VERSION;
                });
            }
            {
                var elem = document.createElement("link");
                elem.setAttribute("rel", "stylesheet");
                elem.setAttribute("type", "text/css");
                elem.setAttribute("media", "screen");
                elem.setAttribute("href", "lib/highlight/" + this._theme.name + ".css");
                document.getElementsByTagName("body")[0].appendChild(elem);
            }
            this._queryElement = document.getElementById("query");
            this._queryElement.addEventListener("input", function (e) {
                _this.performQuery(_this._queryElement.value);
            });
            this._footerElement = document.getElementsByTagName("footer")[0];
            this._pageCanvas = document.getElementById("pageCanvas");
            this.initPanels();
            this.initPages();
            this.resize();
            window.addEventListener("resize", function () { return self.resize(); });
            window.addEventListener("keydown", function (e) { return self.keyDown(e); });
        };
        UI.prototype.initPanels = function () {
            this._docsPanel = new Chains.DocsPanel();
            this._examplePanel = new Chains.ExamplePanel();
        };
        UI.prototype.initPages = function () {
            document.getElementById("pageCanvas");
            this._pages = [new Chains.ChainsPage(this._pageCanvas)];
            this._activePage = this._pages[0];
            this._activePage.activate();
        };
        UI.prototype.loadIcon = function (src) {
            var img = document.createElement("img");
            img.src = "icons/" + src + ".png";
            img.style.width = "16px";
            return img;
        };
        UI.prototype.resize = function () {
            var width = window.innerWidth;
            var height = window.innerHeight;
            {
                var h = window.innerHeight - this._queryElement.offsetHeight - 60 - this._footerElement.offsetHeight;
                this._pageCanvas.style.width = width + "px";
                this._pageCanvas.width = width;
                this._pageCanvas.style.height = h + "px";
                this._pageCanvas.height = h;
            }
            this._activePage.resize(width, height);
            this._docsPanel.resize(width, height);
        };
        UI.prototype.keyDown = function (e) {
            if (e.keyCode === 27) {
                if (this.currentPanel) {
                    this.currentPanel.toggleVisibility();
                }
            }
        };
        UI.prototype.performQuery = function (query) {
            this._activePage.performQuery(query);
        };
        return UI;
    }());
    Chains.ui = new UI();
})(Chains || (Chains = {}));
