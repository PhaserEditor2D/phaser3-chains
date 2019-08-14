namespace Chains {

    class ChainMatchInfo {
        constructor(
            public chainItem: ChainItem,
            public exampleFile: ExampleFile,
            public exampleLine: ExampleLine,
            public matchStart: number,
            public matchEnd: number
        ) {

        }
    }

    class ChainCellRenderer implements ICellRenderer<ChainMatchInfo> {

        render(renderInfo: RenderCellInfo<ChainMatchInfo>) {
            let ctx = renderInfo.context;
            let selected = renderInfo.selected;
            let y = renderInfo.y;
            let info = renderInfo.data;
            let ui = Chains.ui;

            ctx.font = renderInfo.data.chainItem.depth > 0 ? "italic 20px monospace" : "20px monospace";
            let gm = ctx.measureText("M");
            let charW = gm.width;
            let charH = 22;

            // paint match rect

            ctx.fillStyle = "rgba(255, 166, 0, 0.1)";
            ctx.strokeStyle = selected ? (Chains.ui.getTheme().name === "dark" ? "white" : "darkred") : "brown";
            //ctx.fillRect(20 + charW * info.matchStart, y + 2, charW * (info.matchEnd - info.matchStart), 26);
            ctx.strokeRect(20 + charW * info.matchStart, y + 2, charW * (info.matchEnd - info.matchStart), 26);

            // prepare chain painting

            let chain = renderInfo.data.chainItem;
            let chainCode = chain.depth == 0 ? "@" : "%";
            let chainLine = chainCode + chain.chain;
            let index = chainLine.lastIndexOf(".");
            let declType = chainLine.slice(1, index);
            let member = chainLine.slice(index, chainLine.length);
            let args = "";
            index = member.indexOf("(");
            if (index >= 0) {
                args = member.substring(index, member.length);
                member = member.substring(0, index);
            }

            let x = 0;
            let textY = y + charH;

            let img = ui.getIcon(chain.icon);
            ctx.drawImage(img, 0, y + 5, 20, 20);

            x += 20;

            ctx.fillStyle = "darkGray";
            ctx.fillText(chainCode, x, textY);
            x += charW;

            ctx.fillStyle = ui.getTheme().chainDeclTypeColor;
            ctx.fillText(declType, x, textY);
            x += declType.length * charW;

            ctx.fillStyle = "#866e3c";
            ctx.fillText(member, x, textY);
            x += member.length * charW;

            if (args) {
                ctx.fillStyle = ui.getTheme().chainArgsColor;
                ctx.fillText(args, x, textY);
                x += args.length * charW;
            }
            let str = " : " + chain.returnType;
            ctx.fillStyle = ui.getTheme().chainRetTypeColor;
            ctx.fillText(str, x, textY);
            x += str.length * charW;

            str = chain.inherited ? " #i" : " #d";
            ctx.fillStyle = ui.getTheme().chainTagColor;
            ctx.fillText(str, x, textY);
            x += str.length * charW;

            if (chain.member.since) {
                ctx.fillStyle = ui.getTheme().chainVerColor;
                str = " v" + chain.member.since;
                ctx.fillText(str, x, textY);
                x += str.length * charW;
            }

        }

    }

    abstract class SimpleCellRenderer implements ICellRenderer<ChainMatchInfo> {

        render(renderInfo: RenderCellInfo<ChainMatchInfo>) {
            let ctx = renderInfo.context;
            let selected = renderInfo.selected;
            let y = renderInfo.y;
            let info = renderInfo.data;

            ctx.font = "20px monospace";
            let gm = ctx.measureText("M");
            let charW = gm.width;
            let charH = 22;

            // paint match rect

            ctx.fillStyle = "rgba(255, 166, 0, 0.1)";
            ctx.strokeStyle = selected ? (Chains.ui.getTheme().name === "dark" ? "white" : "darkred") : "brown";
            ctx.strokeRect(this.getMatchingOffset(renderInfo, charW) + charW * info.matchStart + 1, y + 2, charW * (info.matchEnd - info.matchStart) - 1, 26);

            // label

            this.renderText(renderInfo, y, charW, charH);
        }

        getMatchingOffset(renderInfo: RenderCellInfo<ChainMatchInfo>, charW: number) {
            return 0;
        }

        abstract renderText(renderInfo: RenderCellInfo<ChainMatchInfo>, y: number, charW: number, charH: number): void;
    }

    class ExampleFileCellRenderer extends SimpleCellRenderer {
        renderText(renderInfo: RenderCellInfo<ChainMatchInfo>, y: number, charW: number, charH: number): void {
            let ctx = renderInfo.context;
            ctx.fillStyle = Chains.ui.getTheme().exampleFileColor;
            ctx.fillText("/" + renderInfo.data.exampleFile.filename, 0, y + charH);
        }
    }

    class ExampleLineCellRenderer extends SimpleCellRenderer {

        renderText(renderInfo: RenderCellInfo<ChainMatchInfo>, y: number, charW: number, charH: number): void {
            let ctx = renderInfo.context;

            let x = 0;
            let number = renderInfo.data.exampleLine.number + "";
            ctx.fillStyle = ui.getTheme().exampleLineColor;
            ctx.fillRect(x + 1, y, number.length * charW - 1, 29);
            ctx.fillStyle = ui.getTheme().exampleLineNumberColor;
            ctx.fillText(number, x, y + charH - 2);

            x += this.getMatchingOffset(renderInfo, charW);

            ctx.fillStyle = Chains.ui.getTheme().exampleLineColor;
            let line = renderInfo.data.exampleLine;

            ctx.fillText(">" + line.line, x, y + charH);
            x += (line.line.length + 1) * charW;

            ctx.fillStyle = Chains.ui.getTheme().exampleFileColor;
            ctx.fillText("/" + line.file.filename, x, y + charH);
        }

        getMatchingOffset(renderInfo: RenderCellInfo<ChainMatchInfo>, charW: number) {
            return (renderInfo.data.exampleLine.number + "").length * charW;
        }

    }



    class ChainRendererProvider implements ICellRendererProvider<ChainMatchInfo> {
        private _chainRenderer: ChainCellRenderer;
        private _exampleFileRenderer: ExampleFileCellRenderer;
        private _exampleLineRenderer: ExampleLineCellRenderer;

        constructor() {
            this._chainRenderer = new ChainCellRenderer();
            this._exampleFileRenderer = new ExampleFileCellRenderer();
            this._exampleLineRenderer = new ExampleLineCellRenderer();
        }

        getCellRenderer(item: ChainMatchInfo): ICellRenderer<ChainMatchInfo> {
            if (item.chainItem) {
                return this._chainRenderer;
            } else if (item.exampleLine) {
                return this._exampleLineRenderer;
            }

            return this._exampleFileRenderer;
        }

    }

    export class ChainsPage implements IPage {

        private _view: ListView<ChainMatchInfo>;
        private _canvas: HTMLCanvasElement;
        showChains = true;
        showExamples = true;

        constructor(canvas: HTMLCanvasElement) {
            this._canvas = canvas;
            this._view = new ListView<ChainMatchInfo>(this._canvas, new ChainRendererProvider());
            this._view.addSelectionEventListener(this.onItemSelected, this);

            let params = new URLSearchParams(document.location.search);
            let query = params.get("query");
            if (query) {
                localStorage.chainsLastQuery = query;
            }
        }

        private onItemSelected() {
            let item = this._view.getSelectedItem();
            if (item.chainItem) {
                ui.getExamplePanel().hidePanel();
                ui.getDocsPanel().showDoc(item.chainItem.member);
            } else if (item.exampleFile) {
                ui.getDocsPanel().hideDocs();
                ui.getExamplePanel().showExample(item.exampleFile);
            } else if (item.exampleLine) {
                ui.getDocsPanel().hideDocs();
                ui.getExamplePanel().showExample(item.exampleLine.file, item.exampleLine.number);
            }
        }

        themeChanged() {
            this._view.repaint();
        }

        activate() {
            let query = localStorage.chainsLastQuery || "this load (";
            Chains.ui.setQuery(query, true);
        }

        resize(width: number, height: number): void {
            this._view.resize(width, height);
        }

        static EXPAND = {
            "this.": "phaser.scene.",
            "this ": "phaser.scene. ",
            "@ this.": "@ phaser.scene.",
            "@ this ": "@ phaser.scene.",
            "% this.": "% phaser.scene.",
            "% this ": "% phaser.scene. "
        };

        performQuery(query: string): void {
            localStorage.chainsLastQuery = query;
            query = query.toLowerCase();

            let chainsMatches: ChainMatchInfo[] = [];
            let examplesFilesMatches: ChainMatchInfo[] = [];
            let examplesLinesMatches: ChainMatchInfo[] = [];

            if (query.length > 0) {

                if (this.showChains) {
                    let query2 = query;

                    for (let key in ChainsPage.EXPAND) {
                        let value = ChainsPage.EXPAND[key];
                        if (query.startsWith(key)) {
                            query2 = value + query.substring(key.length);
                        }
                    }

                    console.log(query2);

                    let queryParts = query2.split(" ").map(q => q.trim()).filter(q => q.length > 0);

                    for (let chain of Chains.store.getChainsData()) {                        
                        let result = this.matches(queryParts, chain.searchLine);
                        if (result.ok) {
                            chainsMatches.push(new ChainMatchInfo(chain, null, null, result.start, result.end));
                        }
                    }
                }

                if (this.showExamples) {

                    let queryParts = query.split(" ").map(q => q.trim()).filter(q => q.length > 0);

                    for (let file of Chains.store.getExampleFilesData()) {
                        let result = this.matches(queryParts, "/" + file.filename.toLowerCase());
                        if (result.ok) {
                            examplesFilesMatches.push(new ChainMatchInfo(null, file, null, result.start, result.end));
                        }
                    }

                    for (let line of Chains.store.getExampleLinesData()) {
                        let result = this.matches(queryParts, ">" + line.line.toLowerCase());
                        if (result.ok) {
                            examplesLinesMatches.push(new ChainMatchInfo(null, null, line, result.start, result.end));
                        }
                    }
                }
            }

            let matches = [];

            for (let x of chainsMatches) {
                matches.push(x);
            }

            for (let x of examplesFilesMatches) {
                matches.push(x);
            }

            for (let x of examplesLinesMatches) {
                matches.push(x);
            }

            this._view.setMiniMap([
                {
                    length: chainsMatches.length,
                    color: ui.getTheme().chainDeclTypeColor
                },
                {
                    length: examplesFilesMatches.length,
                    color: ui.getTheme().exampleFileColor
                },
                {
                    length: examplesLinesMatches.length,
                    color: ui.getTheme().exampleLineColor
                }
            ]);
            this._view.setItems(matches);
        }

        matches(queryParts: string[], input: string) {
            let all = true;
            let start = -1;
            let end = 0;
            for (let queryPart of queryParts) {
                let index = input.indexOf(queryPart, end);
                if (index >= end) {
                    if (start === -1) {
                        start = index;
                    }
                    end = index + queryPart.length;
                } else {
                    all = false;
                    break;
                }
            }
            return {
                ok: all,
                start: start,
                end: end
            };
        }
    }
}