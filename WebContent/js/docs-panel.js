var Chains;
(function (Chains) {
    var DocsPanel = (function () {
        function DocsPanel() {
            this._docsHistory = [];
            this._docsHistoryIndex = -1;
            this._docsContainerElement = document.getElementById("docsContainer");
            this._docsContentElement = document.getElementById("docsContent");
            this._docsSectionsElement = document.getElementById("docsSections");
            this._converter = new window.showdown.Converter();
        }
        DocsPanel.prototype.resize = function (width, height) {
            this.layout();
        };
        DocsPanel.prototype.layout = function () {
            if (this._docsContainerElement.style.display === "none") {
                return;
            }
            var width = (window.innerWidth * (window.innerWidth < 1500 ? 0.4 : 0.3)) | 0;
            this._docsContainerElement.style.width = width + "px";
            this._docsContainerElement.style.left = (window.innerWidth - width - 115) + "px";
        };
        DocsPanel.prototype.hideDocs = function () {
            this._docsContainerElement.style.display = "none";
        };
        DocsPanel.prototype.docsHistoryBack = function () {
            if (this._docsHistory.length > 0) {
                if (this._docsHistoryIndex > 0) {
                    this._docsHistoryIndex--;
                    this.showDoc(this._docsHistory[this._docsHistoryIndex], false);
                }
            }
        };
        DocsPanel.prototype.docsHistoryNext = function () {
            if (this._docsHistoryIndex + 1 < this._docsHistory.length) {
                this._docsHistoryIndex++;
                this.showDoc(this._docsHistory[this._docsHistoryIndex], false);
            }
        };
        DocsPanel.prototype.toggleVisibility = function () {
            if (this._docsContainerElement.style.display === "none") {
                if (this._currentMemberInDocs) {
                    this.showDoc(this._currentMemberInDocs);
                }
            }
            else {
                this._docsContainerElement.style.display = "none";
            }
        };
        DocsPanel.prototype.showDocFromId = function (memberId) {
            this.showDoc(Chains.store.getApiMember(memberId), true);
        };
        DocsPanel.prototype.showDoc = function (member, record) {
            if (record === void 0) { record = true; }
            var self = this;
            Chains.ui.currentPanel = this;
            this._docsContainerElement.style.display = "inherit";
            if (this._currentMemberInDocs === member) {
                return;
            }
            var doc = this._converter.makeHtml(member.doc);
            doc = "<div id='docTop'>" + doc + "</div>";
            if (!doc) {
                return;
            }
            this._currentMemberInDocs = member;
            if (record) {
                this._docsHistory = this._docsHistory.slice(0, this._docsHistoryIndex + 1);
                this._docsHistory.push(member);
                this._docsHistoryIndex++;
            }
            this._docsContentElement.innerHTML = doc;
            var result = this._docsContentElement.querySelectorAll(".doc-section");
            this._docsSectionsElement.innerHTML = "<a class=\"docsSectionLink\" href=\"#docTop\">Top</a>";
            result.forEach(function (elem) {
                var name = elem.innerHTML;
                name = name.trim();
                if (name.endsWith(":")) {
                    name = name.substring(0, name.length - 1);
                }
                elem.id = "section-" + name;
                self._docsSectionsElement.innerHTML += "<a class=\"docsSectionLink\" href=\"#" + elem.id + "\">" + name + "</a>";
            });
            var links = this._docsContentElement.querySelectorAll("a");
            for (var i = 0; i < links.length; i++) {
                var link_1 = links.item(i);
                var href = link_1.href;
                var index = href.lastIndexOf("/");
                href = href.substring(index + 1);
                href = "javascript:Chains.ui.getDocsPanel().showDocFromId(\"" + href + "\")";
                link_1.href = href;
            }
            this._docsContentElement.querySelectorAll('code').forEach(function (block) {
                if (block.parentElement.tagName.toLowerCase() !== "pre") {
                    window.hljs.highlightBlock(block);
                    block.style.display = "initial";
                }
            });
            this._docsContentElement.querySelectorAll('pre code').forEach(function (block) {
                window.hljs.highlightBlock(block);
            });
            var link = document.getElementById("gotoSource");
            link.href = "https://github.com/photonstorm/phaser/blob/v" + Chains.PHASER_VERSION + "/src/" + member.file + "#L" + member.line;
            this._docsContentElement.scrollTo(0, 0);
            this.layout();
        };
        return DocsPanel;
    }());
    Chains.DocsPanel = DocsPanel;
})(Chains || (Chains = {}));
