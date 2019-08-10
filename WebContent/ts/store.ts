namespace Chains {


    export class ChainItem {
        member: ApiMember;

        constructor(
            public readonly chain: string,
            public readonly returnType: string,
            public readonly icon: string,
            public readonly memberId: string,
            public readonly searchInput = (chain + " : " + returnType).toLowerCase()
        ) {

        }
    }

    export class ApiMember {
        constructor(
            public readonly id: string,
            public readonly file: string,
            public readonly line: number,
            public readonly doc: string,
            public readonly since: string,
        ) {

        }
    }

    export class ExampleLine {
        constructor(
            public readonly number: number,
            public readonly line: string,
            public readonly file: ExampleFile
        ) {
        }
    }

    export class ExampleFile {
        constructor(
            public readonly filename
        ) {

        }
    }

    class Store {

        private _chainsData: ChainItem[];
        private _apiMembersData: Map<string, ApiMember> = new Map();
        private _examplesLines: ExampleLine[] = [];
        private _examplesFiles: ExampleFile[] = [];

        constructor() {

        }

        async init() {
            let preloadElement = document.getElementById("preload");
            preloadElement.style.display = "inherit";

            {
                let msg = document.createElement("p");
                msg.innerHTML = `I support Phaser v${PHASER_VERSION}.`;
                preloadElement.appendChild(msg);

                msg = document.createElement("p");
                msg.innerHTML = `Now I will fetch some resources but it takes a while...`;
                preloadElement.appendChild(msg);

                msg = document.createElement("p");
                msg.innerHTML = `(I invite you to read my <a href="https://github.com/PhaserEditor2D/phaser3-chains">documentation</a>, it is short)`;
                preloadElement.appendChild(msg);
            }
            {
                let msg = document.createElement("p");
                msg.innerHTML = "I am fetching the chains ~10MB [1/3]...";
                preloadElement.appendChild(msg);
            }

            let resp = await fetch(`data/api-${Chains.VERSION}.json`);
            let apiData = await resp.json();
            this.createApiMembers(apiData);

            {
                let msg = document.createElement("p");
                msg.innerHTML = "I am fetching the docs ~8MB [2/3]...";
                preloadElement.appendChild(msg);
            }

            resp = await fetch(`data/chains-${Chains.VERSION}.json`);
            let chainsData = await resp.json();
            this.createChainsData(chainsData);

            {
                let msg = document.createElement("p");
                msg.innerHTML = "I am fetching the examples ~7MB [3/3]...";
                preloadElement.appendChild(msg);
            }

            resp = await fetch(`data/examples-${Chains.VERSION}.json`);
            let examplesData = await resp.json();
            this.createExamplesData(examplesData);

            preloadElement.remove();
        }

        createExamplesData(examplesData: any[]) {
            for (let file of examplesData) {
                let exampleFile = new ExampleFile(file["file"]);
                this._examplesFiles.push(exampleFile);
                for (let line of file.lines) {
                    this._examplesLines.push(new ExampleLine(line.num, line.line, exampleFile));
                }
            }
        }

        createChainsData(chainsData: any) {
            this._chainsData = [];
            for (let item of chainsData) {
                let chain = new ChainItem(item.chain, item.retType, item.icon, item.id);
                chain.member = this.getApiMember(chain.memberId);
                this._chainsData.push(chain);
            }
        }

        createApiMembers(apiData: any) {
            for (let k in apiData) {
                let item = apiData[k];
                this._apiMembersData.set(k, new ApiMember(
                    k,
                    item.file,
                    item.line,
                    item.doc,
                    item.since
                ));
            }
        }

        getChainsData() {
            return this._chainsData;
        }

        getExampleFilesData() {
            return this._examplesFiles;
        }

        getExampleLinesData() {
            return this._examplesLines;
        }

        getApiMember(id: string) {
            return this._apiMembersData.get(id);
        }

        getDoc(id: string) {
            let member = this.getApiMember(id);
            if (member) {
                return member.doc;
            }
            return "";
        }
    }

    export const store = new Store();
}