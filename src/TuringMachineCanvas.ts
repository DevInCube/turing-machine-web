import { TuringMachine } from "./TuringMachine";

export class TuringMachineCanvas {
	static cell_size: number = 40;
	static cell_border: number = 2;

	private machine: TuringMachine | null;
	private ctx: CanvasRenderingContext2D | null;
	private font_size: number;

	constructor(readonly canvas: HTMLCanvasElement) {

		this.machine = null;

		this.canvas.style.width = '100%';
		this.canvas.width = this.canvas.offsetWidth;
		this.canvas.height = 200;

		this.ctx = this.canvas.getContext('2d');

		this.font_size = 32;
	}

	setMachine(machine: TuringMachine): void {
		this.machine = machine;
	}

	draw(): void {
		this.canvas.width = this.canvas.width;
		var width = this.canvas.width;
		var height = this.canvas.height;
		var input_word = this.machine ? this.machine.strip_cells : [' '];
		var caret_position = this.machine ? this.machine.caret_position : 0;
		var is_stopped = !this.machine || this.machine.isStopped();
		let state_id = this.machine ? this.machine.getCurrentState() : TuringMachine.stop_state;

		var length = input_word.length;
		if (length > 10) {
			TuringMachineCanvas.cell_size = 40 - (length - 10) * 0.5;
			if (TuringMachineCanvas.cell_size < 10) TuringMachineCanvas.cell_size = 10;
			this.font_size = 32 - (length - 10) * 0.5;
			if (this.font_size < 12) this.font_size = 12;
		} else {
			TuringMachineCanvas.cell_size = 40;
			TuringMachineCanvas.cell_border = 2;
			this.font_size = 32;
		}
		let strip_width = length * TuringMachineCanvas.cell_size;

		let start_x = (width - strip_width) / 2;
		let middle_y = (height - TuringMachineCanvas.cell_size) / 2;

		let caret_x = start_x + caret_position * TuringMachineCanvas.cell_size;
		let caret_y = middle_y - TuringMachineCanvas.cell_size;

		this.drawCaretBack(caret_x, caret_y, is_stopped);
		this.drawCurrentState(caret_x, caret_y, state_id);

		this.drawStrip(start_x, middle_y, input_word);

		this.drawCaretFront(caret_x, caret_y);
	}

	drawStrip(x: number, middle_y: number, input_word: string[]): void {
		let fade_cells_count = 4;
		let fade_cells_min = 0.05;
		let fade_cells_max = 0.5;
		let face_cells_step = (fade_cells_max - fade_cells_min) / fade_cells_count;
		for (let i = 0; i < fade_cells_count; i++) {
			this.drawEmptyCell(x - TuringMachineCanvas.cell_size * (fade_cells_count - i), middle_y, TuringMachineCanvas.cell_size, fade_cells_min + face_cells_step * i);
		}
		for (let symbol of input_word) {
			this.drawStripCell(x, middle_y, symbol);
			x += TuringMachineCanvas.cell_size;
		}
		for (let i = 0; i < fade_cells_count; i++) {
			this.drawEmptyCell(x + TuringMachineCanvas.cell_size * i, middle_y, TuringMachineCanvas.cell_size, fade_cells_max - face_cells_step * i);
		}
	}

	drawEmptyCell(x: number, y: number, size: number, opacity: number): void {
		var ctx = this.ctx as CanvasRenderingContext2D;
		ctx.fillStyle = `rgba(230, 230, 230, ${opacity})`;
		ctx.fillRect(x, y, size, size);
		ctx.beginPath();
		ctx.lineWidth = TuringMachineCanvas.cell_border;
		ctx.strokeStyle = `rgba(127, 127, 127, ${opacity})`;
		ctx.moveTo(x, y);
		ctx.lineTo(x, y + size);
		// ctx.rect(x, y, size, size);
		ctx.stroke();
	}

	drawStripCell(x: number, y: number, value: string): void {
		this.drawEmptyCell(x, y, TuringMachineCanvas.cell_size, 1);
		var ctx = this.ctx as CanvasRenderingContext2D;

		ctx.fillStyle = '#000000';
		ctx.font = `${this.font_size}px Consolas`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		var text_size = ctx.measureText(value);
		ctx.fillText(value, x + (TuringMachineCanvas.cell_size - text_size.width) / 2, y + (TuringMachineCanvas.cell_size - this.font_size) / 2);
	}

	drawCaretBack(x: number, y: number, isStopped: boolean): void {
		var ctx = this.ctx as CanvasRenderingContext2D;
		ctx.fillStyle = isStopped ? '#ffcccc' : '#ccccff';
		ctx.fillRect(x, y, TuringMachineCanvas.cell_size, TuringMachineCanvas.cell_size * 3);
	}

	drawCurrentState(x: number, y: number, stateId: string): void {
		var ctx = this.ctx as CanvasRenderingContext2D;
		ctx.fillStyle = '#000000';
		var font_size = this.font_size - 10;
		ctx.font = `${font_size}px Consolas bold`;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		var text_size = ctx.measureText(stateId);
		ctx.fillText(stateId, x + (TuringMachineCanvas.cell_size - text_size.width) / 2, y + (TuringMachineCanvas.cell_size - font_size) / 2);
	}

	drawCaretFront(x: number, y: number): void {
		var ctx = this.ctx as CanvasRenderingContext2D;
		ctx.beginPath();
		ctx.lineWidth = TuringMachineCanvas.cell_border * 2;
		ctx.strokeStyle = "black";
		ctx.rect(x, y + TuringMachineCanvas.cell_size, TuringMachineCanvas.cell_size, TuringMachineCanvas.cell_size);
		ctx.stroke();
	}
}
