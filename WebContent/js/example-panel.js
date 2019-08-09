var Chains;
(function (Chains) {
    var ExamplePanel = (function () {
        function ExamplePanel() {
            this._containerElement = document.getElementById("exampleContainer");
            this._playElement = document.getElementById("example_play");
            this._sourceElement = document.getElementById("example_source");
            this._source2Element = document.getElementById("example_source_link");
            {
                var params = new URLSearchParams(document.location.search);
                this._localExamplesPort = params.get("port");
            }
        }
        ExamplePanel.prototype.toggleVisibility = function () {
            if (this._containerElement.style.display === "none") {
                if (this._currentExampleFileInPanel) {
                    this.showExample(this._currentExampleFileInPanel, this._currentExampleLineInPanel);
                }
            }
            else {
                this._containerElement.style.display = "none";
            }
        };
        ExamplePanel.prototype.showExample = function (example, line) {
            if (line === void 0) { line = undefined; }
            Chains.ui.currentPanel = this;
            this._currentExampleFileInPanel = example;
            this._currentExampleLineInPanel = line;
            this._containerElement.style.display = "inherit";
            if (this._localExamplesPort) {
                this._playElement.href = "http://127.0.0.1:" + this._localExamplesPort + "/view.html?src=src/" + example.filename + "&v=" + Chains.PHASER_VERSION;
                this._sourceElement.href = "http://127.0.0.1:" + this._localExamplesPort + "/edit.html?src=src/" + example.filename;
            }
            else {
                var name_1 = example.filename;
                name_1 = name_1.substring(0, name_1.length - 3);
                var name2 = "";
                for (var i = 0; i < name_1.length; i++) {
                    var ch = name_1.charAt(i);
                    ch = ch.replace(" ", "-");
                    name2 += ch;
                }
                this._playElement.href = "https://phaser.io/examples/v3/view/" + name2;
                this._sourceElement.href = "https://github.com/photonstorm/phaser3-examples/blob/master/public/src/" + example.filename + "#L" + line;
            }
            this._source2Element.innerHTML = example.filename + (line ? " [" + line + "]" : "");
            this._source2Element.href = this._sourceElement.href;
        };
        ExamplePanel.prototype.hidePanel = function () {
            this._containerElement.style.display = "none";
        };
        return ExamplePanel;
    }());
    Chains.ExamplePanel = ExamplePanel;
})(Chains || (Chains = {}));
