namespace Chains {

    export class DocsPanel implements IPanel {


        private _docsContainerElement: HTMLDivElement;
        private _docsContentElement: HTMLDivElement;
        private _docsSectionsElement: HTMLSpanElement;
        private _docsHistory: ApiMember[] = [];
        private _docsHistoryIndex = -1;
        private _currentMemberInDocs: ApiMember;
        private _converter: any;

        constructor() {
            this._docsContainerElement = <HTMLDivElement>document.getElementById("docsContainer");
            this._docsContentElement = <HTMLDivElement>document.getElementById("docsContent");
            this._docsSectionsElement = <HTMLSpanElement>document.getElementById("docsSections");
            this._converter = new (<any>window).showdown.Converter();
        }

        resize(width: number, height: number) {
            this.layout();
        }

        private layout() {
            if (this._docsContainerElement.style.display === "none") {
                return;
            }

            let width = (window.innerWidth * (window.innerWidth < 1500 ? 0.4 : 0.3)) | 0;
            this._docsContainerElement.style.width = width + "px";
            this._docsContainerElement.style.left = (window.innerWidth - width - 115) + "px";
        }

        hideDocs() {
            this._docsContainerElement.style.display = "none";
        }

        docsHistoryBack() {
            if (this._docsHistory.length > 0) {
                if (this._docsHistoryIndex > 0) {
                    this._docsHistoryIndex--;
                    this.showDoc(this._docsHistory[this._docsHistoryIndex], false);
                }
            }
        }

        docsHistoryNext() {
            if (this._docsHistoryIndex + 1 < this._docsHistory.length) {
                this._docsHistoryIndex++;
                this.showDoc(this._docsHistory[this._docsHistoryIndex], false);
            }
        }

        toggleVisibility() {
            if (this._docsContainerElement.style.display === "none") {
                if (this._currentMemberInDocs) {
                    this.showDoc(this._currentMemberInDocs);
                }
            } else {
                this._docsContainerElement.style.display = "none";
            }
        }

        showDocFromId(memberId: string) {
            this.showDoc(Chains.store.getApiMember(memberId), true);
        }

        showDoc(member: ApiMember, record: boolean = true) {
            const self = this;

            ui.currentPanel = this;

            this._docsContainerElement.style.display = "inherit";

            if (this._currentMemberInDocs === member) {
                return;
            }

            let doc = this._converter.makeHtml(member.doc);
            doc = "<div id='docTop'>" + doc + "</div>"

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

            let result = this._docsContentElement.querySelectorAll(".doc-section");
            this._docsSectionsElement.innerHTML = `<a class="docsSectionLink" href="#docTop">Top</a>`;
            result.forEach(elem => {
                let name = elem.innerHTML;
                name = name.trim();
                if (name.endsWith(":")) {
                    name = name.substring(0, name.length - 1);
                }
                elem.id = "section-" + name;
                self._docsSectionsElement.innerHTML += `<a class="docsSectionLink" href="#${elem.id}">${name}</a>`;
            });

            let links = this._docsContentElement.querySelectorAll("a");
            for (let i = 0; i < links.length; i++) {
                let link = <HTMLAnchorElement>links.item(i);
                let href = link.href;
                let index = href.lastIndexOf("/");
                href = href.substring(index + 1);
                href = `javascript:Chains.ui.getDocsPanel().showDocFromId("${href}")`;
                link.href = href;
            }

            this._docsContentElement.querySelectorAll('code').forEach((block) => {
                if (block.parentElement.tagName.toLowerCase() !== "pre") {
                    (<any>window).hljs.highlightBlock(block);
                    block.style.display = "initial";
                }
            });

            this._docsContentElement.querySelectorAll('pre code').forEach((block) => {
                (<any>window).hljs.highlightBlock(block);
            });


            let link = <HTMLAnchorElement>document.getElementById("gotoSource");
            link.href = "https://github.com/photonstorm/phaser/blob/v" + PHASER_VERSION + "/src/" + member.file + "#L" + member.line;

            this._docsContentElement.scrollTo(0, 0);

            this.layout();
        }
    }
}