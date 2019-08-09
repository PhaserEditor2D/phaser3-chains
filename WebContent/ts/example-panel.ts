namespace Chains {
    export class ExamplePanel implements IPanel {

        private _containerElement: HTMLDivElement;
        private _playElement: HTMLAnchorElement;
        private _sourceElement: HTMLAnchorElement;
        private _source2Element: HTMLAnchorElement;
        private _localExamplesPort: string;
        private _currentExampleFileInPanel: ExampleFile;
        private _currentExampleLineInPanel: number;

        constructor() {
            this._containerElement = <HTMLDivElement>document.getElementById("exampleContainer");
            this._playElement = <HTMLAnchorElement>document.getElementById("example_play");
            this._sourceElement = <HTMLAnchorElement>document.getElementById("example_source");
            this._source2Element = <HTMLAnchorElement>document.getElementById("example_source_link");

            {
                let params = new URLSearchParams(document.location.search);
                this._localExamplesPort = params.get("port");
            }
        }

        toggleVisibility() {
            if (this._containerElement.style.display === "none") {
                if (this._currentExampleFileInPanel) {
                    this.showExample(this._currentExampleFileInPanel, this._currentExampleLineInPanel);
                }
            } else {
                this._containerElement.style.display = "none";
            }
        }

        showExample(example: ExampleFile, line: number = undefined) {
            ui.currentPanel = this;
            this._currentExampleFileInPanel = example;
            this._currentExampleLineInPanel = line;

            this._containerElement.style.display = "inherit";

            if (this._localExamplesPort) {
                this._playElement.href = "http://127.0.0.1:" + this._localExamplesPort + "/view.html?src=src/" + example.filename + "&v=" + PHASER_VERSION;
                this._sourceElement.href = "http://127.0.0.1:" + this._localExamplesPort + "/edit.html?src=src/" + example.filename;
            } else {
                // play
                let name: string = example.filename;
                name = name.substring(0, name.length - 3);
                let name2 = "";
                for (let i = 0; i < name.length; i++) {
                    let ch = name.charAt(i);
                    ch = ch.replace(" ", "-");
                    name2 += ch;
                }
                this._playElement.href = "https://phaser.io/examples/v3/view/" + name2;

                // source
                this._sourceElement.href = "https://github.com/photonstorm/phaser3-examples/blob/master/public/src/" + example.filename + "#L" + line;
            }

            this._source2Element.innerHTML = example.filename + (line ? " [" + line + "]" : "");
            this._source2Element.href = this._sourceElement.href;

        }

        hidePanel() {
            this._containerElement.style.display = "none";
        }
    }
}