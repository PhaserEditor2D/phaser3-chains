var Chains;
(function (Chains) {
    var RenderCellInfo = (function () {
        function RenderCellInfo(index, data, x, y, width, height, selected, context) {
            this.index = index;
            this.data = data;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.selected = selected;
            this.context = context;
        }
        return RenderCellInfo;
    }());
    Chains.RenderCellInfo = RenderCellInfo;
    var ListView = (function () {
        function ListView(canvas, renderProvider) {
            this._mouseX = 0;
            this._mouseY = 0;
            this._hoverItemIndex = -1;
            this._selectedItemIndex = 1;
            this._scrollY = 0;
            this._dragInitialMouseY = -1;
            this._miniMap = [];
            this._canvas = canvas;
            this._renderProvider = renderProvider;
            this._items = [];
            this.registerListeners();
        }
        ListView.prototype.registerListeners = function () {
            var self = this;
            this._canvas.addEventListener("mousemove", function (e) { return self.onMouseMove(e); });
            this._canvas.addEventListener("mouseup", function (e) { return self.onMouseUp(e); });
            this._canvas.addEventListener("mousedown", function (e) { return self.onMouseDown(e); });
            this._canvas.addEventListener("wheel", function (e) { return self.onMouseWheel(e); });
        };
        ListView.prototype.onMouseWheel = function (e) {
            this._scrollY += Math.sign(e.deltaY) * 30;
            this.repaint();
        };
        ListView.prototype.onMouseMove = function (e) {
            if (e.buttons === 1) {
                if (this._dragInitialMouseY > -1) {
                    var y = e.offsetY;
                    var delta = y - this._dragInitialMouseY;
                    this._scrollY = this._dragInitialScrollY + delta * this._canvas.height / this._scrollBarSize;
                }
            }
            else {
                this._dragInitialMouseY = -1;
            }
            this._mouseX = e.offsetX;
            this._mouseY = e.offsetY;
            this.repaint();
        };
        ListView.prototype.onMouseUp = function (e) {
            if (e.offsetX < this._canvas.width - 20 && this._dragInitialMouseY === -1) {
                this._selectedItem = this._hoverItem;
                this._selectedItemIndex = this._hoverItemIndex;
                this._canvas.dispatchEvent(new Event("itemselected"));
            }
            this._dragInitialMouseY = -1;
            this.repaint();
        };
        ListView.prototype.onMouseDown = function (e) {
            var x = e.offsetX;
            var y = e.offsetY;
            if (x > this._canvas.width - 30 && e.buttons === 1) {
                if (y < this._scrollBarY || y > this._scrollBarY + this._scrollBarSize) {
                    var delta = this._scrollBarY + this._scrollBarSize / 2 - y;
                    this._scrollY += -delta * this._canvas.height / this._scrollBarSize;
                }
                else {
                    this._dragInitialMouseY = y;
                    this._dragInitialScrollY = this._scrollY;
                }
            }
            this.repaint();
        };
        ListView.prototype.addSelectionEventListener = function (listener, context) {
            this._canvas.addEventListener("itemselected", (function (ctx) { return function () { return listener.apply(ctx); }; })(context));
        };
        ListView.prototype.getSelectedItem = function () {
            return this._selectedItem;
        };
        ListView.prototype.getSelectedIndex = function () {
            return this._selectedItemIndex;
        };
        ListView.prototype.setMiniMap = function (miniMap) {
            this._miniMap = miniMap;
        };
        ListView.prototype.getCanvas = function () {
            return this._canvas;
        };
        ListView.prototype.getRenderProvider = function () {
            return this._renderProvider;
        };
        ListView.prototype.setItems = function (items) {
            this._items = items;
            this._scrollY = 0;
            this.repaint();
        };
        ListView.prototype.getItems = function () {
            return this._items;
        };
        ListView.prototype.resize = function (width, height) {
            this.repaint();
        };
        ListView.prototype.repaint = function () {
            {
                if (this._scrollY < 0) {
                    this._scrollY = 0;
                }
                else {
                    var top_1 = this._items.length * 30 - this._canvas.height;
                    if (this._scrollY > top_1) {
                        this._scrollY = top_1;
                    }
                }
                var contentTotal = this._items.length * 30;
                var contentScreen = Math.min(this._canvas.height, contentTotal);
                if (contentTotal < this._canvas.height) {
                    this._scrollBarSize = 0;
                    this._scrollBarY = 0;
                    this._scrollY = 0;
                }
                else {
                    var totalRatio = contentScreen / contentTotal;
                    var scrollRatio = this._scrollY / contentTotal;
                    this._scrollBarSize = this._canvas.height * totalRatio;
                    this._scrollBarY = (this._canvas.height) * scrollRatio;
                }
            }
            var ctx = this._canvas.getContext("2d");
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
            var y = 0;
            y = -this._scrollY;
            var index = 0;
            for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
                var item = _a[_i];
                if (y > -30) {
                    if (this._mouseY >= y && this._mouseY < y + 30 && this._mouseX < this._canvas.width - 30) {
                        ctx.fillStyle = Chains.ui.getTheme().selectionHover;
                        ctx.fillRect(0, y, this._canvas.width, 30);
                        this._hoverItem = item;
                        this._hoverItemIndex = index;
                    }
                    var selected = item === this._selectedItem;
                    if (selected) {
                        ctx.fillStyle = "#ff550044";
                        ctx.fillRect(0, y, this._canvas.width, 30);
                    }
                    var renderer = this._renderProvider.getCellRenderer(item);
                    if (renderer != null) {
                        renderer.render(new RenderCellInfo(index, item, 0, y, this._canvas.width, 30, selected, ctx));
                    }
                }
                y += 30;
                index++;
                if (y > this._canvas.height) {
                    break;
                }
            }
            if (this._scrollBarSize > 0) {
                ctx.fillStyle = Chains.ui.isDarkTheme() ? "#2f2f2f" : "#f0f0f0";
                ctx.fillRect(this._canvas.width - 20, 0, 20, this._canvas.height);
                ctx.fillStyle = Chains.ui.isDarkTheme() ? "#afafaf" : "#8f8f8f";
                ctx.fillRect(this._canvas.width - 20, this._scrollBarY, 20, Math.max(2, this._scrollBarSize));
                {
                    var y_1 = 0;
                    for (var _b = 0, _c = this._miniMap; _b < _c.length; _b++) {
                        var range = _c[_b];
                        ctx.fillStyle = range.color;
                        var ratio = range.length / this._items.length;
                        var delta = this._canvas.height * ratio;
                        ctx.fillRect(this._canvas.width - 25, y_1, 5, delta);
                        y_1 += delta;
                    }
                }
            }
        };
        return ListView;
    }());
    Chains.ListView = ListView;
})(Chains || (Chains = {}));
