namespace Chains {

    export class RenderCellInfo<T> {
        constructor(
            public index: number,
            public data: T,
            public x: number,
            public y: number,
            public width: number,
            public height: number,
            public selected: boolean,
            public context: CanvasRenderingContext2D
        ) {

        }
    }

    export interface ICellRenderer<T> {
        render(info: RenderCellInfo<T>);
    }

    export interface ICellRendererProvider<T> {
        getCellRenderer(item: T): ICellRenderer<T>;
    }

    export declare type MapRange = {
        length: number;
        color: string;
    };

    export class ListView<T> {

        private _canvas: HTMLCanvasElement;
        private _items: T[];
        private _renderProvider: ICellRendererProvider<T>;
        private _mouseX: number = 0;
        private _mouseY: number = 0;
        private _hoverItem: T;
        private _hoverItemIndex: number = -1;
        private _selectedItem: T;
        private _selectedItemIndex: number = 1;
        private _scrollY = 0;
        private _scrollBarSize: number;
        private _scrollBarY: number;
        private _dragInitialMouseY: number = -1;
        private _dragInitialScrollY: number;
        private _miniMap: MapRange[] = [];


        constructor(canvas: HTMLCanvasElement, renderProvider: ICellRendererProvider<T>) {
            this._canvas = canvas;
            this._renderProvider = renderProvider;
            this._items = [];

            this.registerListeners();
        }

        private registerListeners() {
            const self = this;
            this._canvas.addEventListener("mousemove", (e: MouseEvent) => self.onMouseMove(e));
            this._canvas.addEventListener("mouseup", (e: MouseEvent) => self.onMouseUp(e));
            this._canvas.addEventListener("mousedown", (e: MouseEvent) => self.onMouseDown(e));
            this._canvas.addEventListener("wheel", (e: WheelEvent) => self.onMouseWheel(e));
        }

        private onMouseWheel(e: WheelEvent) {
            this._scrollY += Math.sign(e.deltaY) * 30;
            this.repaint();
        }

        private onMouseMove(e: MouseEvent) {
            if (e.buttons === 1) {
                if (this._dragInitialMouseY > -1) {
                    let y = e.offsetY;
                    let delta = y - this._dragInitialMouseY;
                    this._scrollY = this._dragInitialScrollY + delta * this._canvas.height / this._scrollBarSize;
                }
            } else {
                this._dragInitialMouseY = -1;
            }

            this._mouseX = e.offsetX;
            this._mouseY = e.offsetY;

            this.repaint();
        }

        private onMouseUp(e: MouseEvent) {
            if (e.offsetX < this._canvas.width - 20 && this._dragInitialMouseY === -1) {
                this._selectedItem = this._hoverItem;
                this._selectedItemIndex = this._hoverItemIndex;
                this._canvas.dispatchEvent(new Event("itemselected"));
            }
            this._dragInitialMouseY = -1;

            this.repaint();
        }

        private onMouseDown(e: MouseEvent) {
            let x = e.offsetX;
            let y = e.offsetY;


            if (x > this._canvas.width - 30 && e.buttons === 1) {
                if (y < this._scrollBarY || y > this._scrollBarY + this._scrollBarSize) {
                    // outside the bar
                    let delta = this._scrollBarY + this._scrollBarSize / 2 - y;
                    this._scrollY += -delta * this._canvas.height / this._scrollBarSize;
                } else {
                    // inside the bar
                    this._dragInitialMouseY = y;
                    this._dragInitialScrollY = this._scrollY;
                }
            }

            this.repaint();
        }

        addSelectionEventListener(listener: Function, context: any) {
            this._canvas.addEventListener("itemselected", ((ctx) => () => listener.apply(ctx))(context));
        }

        getSelectedItem() {
            return this._selectedItem;
        }

        getSelectedIndex() {
            return this._selectedItemIndex;
        }

        setMiniMap(miniMap: MapRange[]) {
            this._miniMap = miniMap;
        }

        getCanvas() {
            return this._canvas;
        }

        getRenderProvider() {
            return this._renderProvider;
        }

        setItems(items: T[]) {
            this._items = items;
            this._scrollY = 0;
            this.repaint();
        }

        getItems() {
            return this._items;
        }

        resize(width: number, height: number) {
            this.repaint();
        }

        public repaint() {
            // computer scrollbar
            {
                if (this._scrollY < 0) {
                    this._scrollY = 0;
                } else {
                    let top = this._items.length * 30 - this._canvas.height;
                    if (this._scrollY > top) {
                        this._scrollY = top;
                    }
                }

                let contentTotal = this._items.length * 30;
                let contentScreen = Math.min(this._canvas.height, contentTotal);

                if (contentTotal < this._canvas.height) {
                    this._scrollBarSize = 0;
                    this._scrollBarY = 0;
                    this._scrollY = 0;
                } else {
                    let totalRatio = contentScreen / contentTotal;
                    let scrollRatio = this._scrollY / contentTotal;

                    this._scrollBarSize = this._canvas.height * totalRatio;
                    this._scrollBarY = (this._canvas.height) * scrollRatio;
                }
            }

            const ctx = this._canvas.getContext("2d");
            ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

            let y = 0;

            y = -this._scrollY;

            let index = 0;
            for (let item of this._items) {
                if (y > -30) {
                    if (this._mouseY >= y && this._mouseY < y + 30 && this._mouseX < this._canvas.width - 30) {
                        ctx.fillStyle = ui.getTheme().selectionHover;
                        ctx.fillRect(0, y, this._canvas.width, 30);
                        this._hoverItem = item;
                        this._hoverItemIndex = index;
                    }

                    let selected = item === this._selectedItem;
                    if (selected) {
                        ctx.fillStyle = "#ff550044";
                        ctx.fillRect(0, y, this._canvas.width, 30);
                    }

                    let renderer = this._renderProvider.getCellRenderer(item);
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

            // paint scrollBar
            if (this._scrollBarSize > 0) {
                // background
                ctx.fillStyle = ui.isDarkTheme() ? "#2f2f2f" : "#f0f0f0";
                ctx.fillRect(this._canvas.width - 20, 0, 20, this._canvas.height);
                // bar
                ctx.fillStyle = ui.isDarkTheme() ? "#afafaf" : "#8f8f8f";
                ctx.fillRect(this._canvas.width - 20, this._scrollBarY, 20, Math.max(2, this._scrollBarSize));


                // minimap
                {
                    let y = 0
                    for (let range of this._miniMap) {
                        ctx.fillStyle = range.color;
                        let ratio = range.length / this._items.length;
                        let delta = this._canvas.height * ratio;
                        ctx.fillRect(this._canvas.width - 25, y, 5, delta);
                        y += delta;
                    }
                }
            }

        }
    }
}