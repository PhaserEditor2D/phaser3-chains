var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Chains;
(function (Chains) {
    var ChainItem = (function () {
        function ChainItem(chain, returnType, icon, memberId, searchInput) {
            if (searchInput === void 0) { searchInput = (chain + " : " + returnType).toLowerCase(); }
            this.chain = chain;
            this.returnType = returnType;
            this.icon = icon;
            this.memberId = memberId;
            this.searchInput = searchInput;
        }
        return ChainItem;
    }());
    Chains.ChainItem = ChainItem;
    var ApiMember = (function () {
        function ApiMember(id, file, line, doc, since) {
            this.id = id;
            this.file = file;
            this.line = line;
            this.doc = doc;
            this.since = since;
        }
        return ApiMember;
    }());
    Chains.ApiMember = ApiMember;
    var ExampleLine = (function () {
        function ExampleLine(number, line, file) {
            this.number = number;
            this.line = line;
            this.file = file;
        }
        return ExampleLine;
    }());
    Chains.ExampleLine = ExampleLine;
    var ExampleFile = (function () {
        function ExampleFile(filename) {
            this.filename = filename;
        }
        return ExampleFile;
    }());
    Chains.ExampleFile = ExampleFile;
    var Store = (function () {
        function Store() {
            this._apiMembersData = new Map();
            this._examplesLines = [];
            this._examplesFiles = [];
        }
        Store.prototype.init = function () {
            return __awaiter(this, void 0, void 0, function () {
                var preloadElement, msg, resp, apiData, msg, chainsData, msg, examplesData;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            preloadElement = document.getElementById("preload");
                            preloadElement.style.display = "inherit";
                            {
                                msg = document.createElement("p");
                                msg.innerHTML = "Fetching chains [1/3]...";
                                preloadElement.appendChild(msg);
                            }
                            return [4, fetch("data/api-" + Chains.VERSION + ".json")];
                        case 1:
                            resp = _a.sent();
                            return [4, resp.json()];
                        case 2:
                            apiData = _a.sent();
                            this.createApiMembers(apiData);
                            {
                                msg = document.createElement("p");
                                msg.innerHTML = "Fetching API [2/3]...";
                                preloadElement.appendChild(msg);
                            }
                            return [4, fetch("data/chains-" + Chains.VERSION + ".json")];
                        case 3:
                            resp = _a.sent();
                            return [4, resp.json()];
                        case 4:
                            chainsData = _a.sent();
                            this.createChainsData(chainsData);
                            {
                                msg = document.createElement("p");
                                msg.innerHTML = "Fetching examples [3/3]...";
                                preloadElement.appendChild(msg);
                            }
                            return [4, fetch("data/examples-" + Chains.VERSION + ".json")];
                        case 5:
                            resp = _a.sent();
                            return [4, resp.json()];
                        case 6:
                            examplesData = _a.sent();
                            this.createExamplesData(examplesData);
                            {
                                preloadElement.remove();
                            }
                            return [2];
                    }
                });
            });
        };
        Store.prototype.createExamplesData = function (examplesData) {
            for (var _i = 0, examplesData_1 = examplesData; _i < examplesData_1.length; _i++) {
                var file = examplesData_1[_i];
                var exampleFile = new ExampleFile(file["file"]);
                this._examplesFiles.push(exampleFile);
                for (var _a = 0, _b = file.lines; _a < _b.length; _a++) {
                    var line = _b[_a];
                    this._examplesLines.push(new ExampleLine(line.num, line.line, exampleFile));
                }
            }
        };
        Store.prototype.createChainsData = function (chainsData) {
            this._chainsData = [];
            for (var _i = 0, chainsData_1 = chainsData; _i < chainsData_1.length; _i++) {
                var item = chainsData_1[_i];
                var chain = new ChainItem(item.chain, item.retType, item.icon, item.id);
                chain.member = this.getApiMember(chain.memberId);
                this._chainsData.push(chain);
            }
        };
        Store.prototype.createApiMembers = function (apiData) {
            for (var k in apiData) {
                var item = apiData[k];
                this._apiMembersData.set(k, new ApiMember(k, item.file, item.line, item.doc, item.since));
            }
        };
        Store.prototype.getChainsData = function () {
            return this._chainsData;
        };
        Store.prototype.getExampleFilesData = function () {
            return this._examplesFiles;
        };
        Store.prototype.getExampleLinesData = function () {
            return this._examplesLines;
        };
        Store.prototype.getApiMember = function (id) {
            return this._apiMembersData.get(id);
        };
        Store.prototype.getDoc = function (id) {
            var member = this.getApiMember(id);
            if (member) {
                return member.doc;
            }
            return "";
        };
        return Store;
    }());
    Chains.store = new Store();
})(Chains || (Chains = {}));
