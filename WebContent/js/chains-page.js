var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Chains;
(function (Chains) {
    var ChainMatchInfo = (function () {
        function ChainMatchInfo(chainItem, exampleFile, exampleLine, matchStart, matchEnd) {
            this.chainItem = chainItem;
            this.exampleFile = exampleFile;
            this.exampleLine = exampleLine;
            this.matchStart = matchStart;
            this.matchEnd = matchEnd;
        }
        return ChainMatchInfo;
    }());
    var ChainCellRenderer = (function () {
        function ChainCellRenderer() {
        }
        ChainCellRenderer.prototype.render = function (renderInfo) {
            var ctx = renderInfo.context;
            var selected = renderInfo.selected;
            var y = renderInfo.y;
            var info = renderInfo.data;
            var ui = Chains.ui;
            ctx.font = renderInfo.data.chainItem.depth > 0 ? "italic 20px monospace" : "20px monospace";
            var gm = ctx.measureText("M");
            var charW = gm.width;
            var charH = 22;
            ctx.fillStyle = "rgba(255, 166, 0, 0.1)";
            ctx.strokeStyle = selected ? (Chains.ui.getTheme().name === "dark" ? "white" : "darkred") : "brown";
            ctx.strokeRect(20 + charW * info.matchStart, y + 2, charW * (info.matchEnd - info.matchStart), 26);
            var chain = renderInfo.data.chainItem;
            var chainCode = chain.depth == 0 ? "@" : "%";
            var chainLine = chainCode + chain.chain;
            var index = chainLine.lastIndexOf(".");
            var declType = chainLine.slice(1, index);
            var member = chainLine.slice(index, chainLine.length);
            var args = "";
            index = member.indexOf("(");
            if (index >= 0) {
                args = member.substring(index, member.length);
                member = member.substring(0, index);
            }
            var x = 0;
            var textY = y + charH;
            var img = ui.getIcon(chain.icon);
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
            ctx.fillStyle = ui.getTheme().chainRetTypeColor;
            ctx.fillText(" : " + chain.returnType, x, textY);
            x += (" : ".length + chain.returnType.length) * charW;
            if (chain.member.since) {
                ctx.fillStyle = ui.getTheme().chainVerColor;
                ctx.fillText(" v" + chain.member.since, x, textY);
            }
        };
        return ChainCellRenderer;
    }());
    var SimpleCellRenderer = (function () {
        function SimpleCellRenderer() {
        }
        SimpleCellRenderer.prototype.render = function (renderInfo) {
            var ctx = renderInfo.context;
            var selected = renderInfo.selected;
            var y = renderInfo.y;
            var info = renderInfo.data;
            ctx.font = "20px monospace";
            var gm = ctx.measureText("M");
            var charW = gm.width;
            var charH = 22;
            ctx.fillStyle = "rgba(255, 166, 0, 0.1)";
            ctx.strokeStyle = selected ? (Chains.ui.getTheme().name === "dark" ? "white" : "darkred") : "brown";
            ctx.strokeRect(this.getMatchingOffset(renderInfo, charW) + charW * info.matchStart + 1, y + 2, charW * (info.matchEnd - info.matchStart) - 1, 26);
            this.renderText(renderInfo, y, charW, charH);
        };
        SimpleCellRenderer.prototype.getMatchingOffset = function (renderInfo, charW) {
            return 0;
        };
        return SimpleCellRenderer;
    }());
    var ExampleFileCellRenderer = (function (_super) {
        __extends(ExampleFileCellRenderer, _super);
        function ExampleFileCellRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ExampleFileCellRenderer.prototype.renderText = function (renderInfo, y, charW, charH) {
            var ctx = renderInfo.context;
            ctx.fillStyle = Chains.ui.getTheme().exampleFileColor;
            ctx.fillText("/" + renderInfo.data.exampleFile.filename, 0, y + charH);
        };
        return ExampleFileCellRenderer;
    }(SimpleCellRenderer));
    var ExampleLineCellRenderer = (function (_super) {
        __extends(ExampleLineCellRenderer, _super);
        function ExampleLineCellRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ExampleLineCellRenderer.prototype.renderText = function (renderInfo, y, charW, charH) {
            var ctx = renderInfo.context;
            var x = 0;
            var number = renderInfo.data.exampleLine.number + "";
            ctx.fillStyle = Chains.ui.getTheme().exampleLineColor;
            ctx.fillRect(x + 1, y, number.length * charW - 1, 29);
            ctx.fillStyle = Chains.ui.getTheme().exampleLineNumberColor;
            ctx.fillText(number, x, y + charH - 2);
            x += this.getMatchingOffset(renderInfo, charW);
            ctx.fillStyle = Chains.ui.getTheme().exampleLineColor;
            var line = renderInfo.data.exampleLine;
            ctx.fillText(">" + line.line, x, y + charH);
            x += (line.line.length + 1) * charW;
            ctx.fillStyle = Chains.ui.getTheme().exampleFileColor;
            ctx.fillText("/" + line.file.filename, x, y + charH);
        };
        ExampleLineCellRenderer.prototype.getMatchingOffset = function (renderInfo, charW) {
            return (renderInfo.data.exampleLine.number + "").length * charW;
        };
        return ExampleLineCellRenderer;
    }(SimpleCellRenderer));
    var ChainRendererProvider = (function () {
        function ChainRendererProvider() {
            this._chainRenderer = new ChainCellRenderer();
            this._exampleFileRenderer = new ExampleFileCellRenderer();
            this._exampleLineRenderer = new ExampleLineCellRenderer();
        }
        ChainRendererProvider.prototype.getCellRenderer = function (item) {
            if (item.chainItem) {
                return this._chainRenderer;
            }
            else if (item.exampleLine) {
                return this._exampleLineRenderer;
            }
            return this._exampleFileRenderer;
        };
        return ChainRendererProvider;
    }());
    var ChainsPage = (function () {
        function ChainsPage(canvas) {
            this.showChains = true;
            this.showExamples = true;
            this._canvas = canvas;
            this._view = new Chains.ListView(this._canvas, new ChainRendererProvider());
            this._view.addSelectionEventListener(this.onItemSelected, this);
            var params = new URLSearchParams(document.location.search);
            var query = params.get("query");
            if (query) {
                localStorage.chainsLastQuery = query;
            }
        }
        ChainsPage.prototype.onItemSelected = function () {
            var item = this._view.getSelectedItem();
            if (item.chainItem) {
                Chains.ui.getExamplePanel().hidePanel();
                Chains.ui.getDocsPanel().showDoc(item.chainItem.member);
            }
            else if (item.exampleFile) {
                Chains.ui.getDocsPanel().hideDocs();
                Chains.ui.getExamplePanel().showExample(item.exampleFile);
            }
            else if (item.exampleLine) {
                Chains.ui.getDocsPanel().hideDocs();
                Chains.ui.getExamplePanel().showExample(item.exampleLine.file, item.exampleLine.number);
            }
        };
        ChainsPage.prototype.themeChanged = function () {
            this._view.repaint();
        };
        ChainsPage.prototype.activate = function () {
            var query = localStorage.chainsLastQuery || "this load (";
            Chains.ui.setQuery(query, true);
        };
        ChainsPage.prototype.resize = function (width, height) {
            this._view.resize(width, height);
        };
        ChainsPage.prototype.performQuery = function (query) {
            localStorage.chainsLastQuery = query;
            query = query.toLowerCase();
            var chainsMatches = [];
            var examplesFilesMatches = [];
            var examplesLinesMatches = [];
            if (query.length > 0) {
                if (this.showChains) {
                    var query2 = query;
                    for (var key in ChainsPage.EXPAND) {
                        var value = ChainsPage.EXPAND[key];
                        if (query.startsWith(key)) {
                            query2 = value + query.substring(key.length);
                        }
                    }
                    console.log(query2);
                    var queryParts = query2.split(" ").map(function (q) { return q.trim(); }).filter(function (q) { return q.length > 0; });
                    for (var _i = 0, _a = Chains.store.getChainsData(); _i < _a.length; _i++) {
                        var chain = _a[_i];
                        var chainCode = chain.depth == 0 ? "@" : "%";
                        var result = this.matches(queryParts, chainCode + chain.searchInput + (chain.member.since ? " v" + chain.member.since : ""));
                        if (result.ok) {
                            chainsMatches.push(new ChainMatchInfo(chain, null, null, result.start, result.end));
                        }
                    }
                }
                if (this.showExamples) {
                    var queryParts = query.split(" ").map(function (q) { return q.trim(); }).filter(function (q) { return q.length > 0; });
                    for (var _b = 0, _c = Chains.store.getExampleFilesData(); _b < _c.length; _b++) {
                        var file = _c[_b];
                        var result = this.matches(queryParts, "/" + file.filename.toLowerCase());
                        if (result.ok) {
                            examplesFilesMatches.push(new ChainMatchInfo(null, file, null, result.start, result.end));
                        }
                    }
                    for (var _d = 0, _e = Chains.store.getExampleLinesData(); _d < _e.length; _d++) {
                        var line = _e[_d];
                        var result = this.matches(queryParts, ">" + line.line.toLowerCase());
                        if (result.ok) {
                            examplesLinesMatches.push(new ChainMatchInfo(null, null, line, result.start, result.end));
                        }
                    }
                }
            }
            var matches = [];
            for (var _f = 0, chainsMatches_1 = chainsMatches; _f < chainsMatches_1.length; _f++) {
                var x = chainsMatches_1[_f];
                matches.push(x);
            }
            for (var _g = 0, examplesFilesMatches_1 = examplesFilesMatches; _g < examplesFilesMatches_1.length; _g++) {
                var x = examplesFilesMatches_1[_g];
                matches.push(x);
            }
            for (var _h = 0, examplesLinesMatches_1 = examplesLinesMatches; _h < examplesLinesMatches_1.length; _h++) {
                var x = examplesLinesMatches_1[_h];
                matches.push(x);
            }
            this._view.setMiniMap([
                {
                    length: chainsMatches.length,
                    color: Chains.ui.getTheme().chainDeclTypeColor
                },
                {
                    length: examplesFilesMatches.length,
                    color: Chains.ui.getTheme().exampleFileColor
                },
                {
                    length: examplesLinesMatches.length,
                    color: Chains.ui.getTheme().exampleLineColor
                }
            ]);
            this._view.setItems(matches);
        };
        ChainsPage.prototype.matches = function (queryParts, input) {
            var all = true;
            var start = -1;
            var end = 0;
            for (var _i = 0, queryParts_1 = queryParts; _i < queryParts_1.length; _i++) {
                var queryPart = queryParts_1[_i];
                var index = input.indexOf(queryPart, end);
                if (index >= end) {
                    if (start === -1) {
                        start = index;
                    }
                    end = index + queryPart.length;
                }
                else {
                    all = false;
                    break;
                }
            }
            return {
                ok: all,
                start: start,
                end: end
            };
        };
        ChainsPage.EXPAND = {
            "this.": "phaser.scene.",
            "this ": "phaser.scene. ",
            "@ this.": "@ phaser.scene.",
            "@ this ": "@ phaser.scene.",
            "% this.": "% phaser.scene.",
            "% this ": "% phaser.scene. "
        };
        return ChainsPage;
    }());
    Chains.ChainsPage = ChainsPage;
})(Chains || (Chains = {}));
