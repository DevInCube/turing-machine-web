import { MoveDirection, TuringCondition, TuringTransition } from './Transition';

export class TuringMachineCaret {
	private position: number;

	constructor(readonly strip: TuringMachineStrip) {
	}

	write(symbolValue: string): void {
		this.strip.write(this.position, symbolValue);
	}

	read(): string {
		return this.strip.read(this.position);
	}

	move(dir: MoveDirection): void {
		this.position = this.strip.pre_expand(dir, this.position);
		switch (dir) {
			case MoveDirection.Left: {
				this.position -= 1;
				break;
			}
			case MoveDirection.Right: {
				this.position += 1;
				break;
			}
			case MoveDirection.None:
				break;
			default:
				throw `'${dir}' is not a valid caret move direction`;
		}
		this.position = this.strip.post_expand(dir, this.position);
	}

	getPosition() : number {
		return this.position;
	}

	resetPosition(): void {
		this.position = 1;
	}
}

export class TuringMachineStrip {
	static empty_symbol: string = ' ';

	cells: string[];

	constructor() {
		this.cells = [
			TuringMachineStrip.empty_symbol,
			TuringMachineStrip.empty_symbol,
			TuringMachineStrip.empty_symbol
		];
	}

	read(index: number): string {
		return this.cells[index];
	}

	write(index: number, value: string): void {
		this.cells[index] = value;
	}

	pre_expand(dir: MoveDirection, index: number): number {
		switch (dir) {
			case MoveDirection.Left: {
				if ((index == this.cells.length - 2)
					&& (this.cells[index] == TuringMachineStrip.empty_symbol)) {
					this.cells.pop();
				}
				break;
			}
			case MoveDirection.Right: {
				if ((index == 1)
					&& (this.cells[index] == TuringMachineStrip.empty_symbol)) {
					this.cells.shift();
					return 0;
				}
				break;
			}
		}
		return index;
	}

	post_expand(dir: MoveDirection, index: number): number {
		switch (dir) {
			case MoveDirection.Left: {
				if (index == 0) {
					this.cells.unshift(TuringMachineStrip.empty_symbol);
					return 1;
				}
				break;
			}
			case MoveDirection.Right: {
				if (index == this.cells.length - 1)
					this.cells.push(TuringMachineStrip.empty_symbol);
				break;
			}
		}
		return index;
	}

	setInput(inputValue: string): void {
		this.cells = inputValue.split('');
		this.cells.unshift(TuringMachineStrip.empty_symbol);
		this.cells.push(TuringMachineStrip.empty_symbol);
	}

	getOutput(): string {
		let output = '';
		for (let cellVal of this.cells.filter(x => x != TuringMachineStrip.empty_symbol)) {
			output += cellVal
		}
		return output;
	}

	getLength(): number {
		return this.cells.length;
	}
}

//=============================================================
export class TuringMachine {
	static stop_state: string = '!';

	private readonly strip: TuringMachineStrip;
	private readonly caret: TuringMachineCaret;
	private state: string;
	private stop: boolean;
	private iterations: number;

	get configuration(): TuringCondition {
		return new TuringCondition(this.state, this.getCurrentCellValue());
	}

	get strip_cells(): string[] {
		return this.strip.cells;
	}

	get caret_position(): number {
		return this.caret.getPosition();
	}

	constructor(readonly states: string[], readonly initial_state: string, readonly transitions: TuringTransition[]) {
		this.strip = new TuringMachineStrip();
		this.caret = new TuringMachineCaret(this.strip);
		this.stop = false;
		this.iterations = 0;
		this.setState(this.initial_state);
	}

	reset(): void {
		let output = this.strip.getOutput();
		this.stop = false;
		this.iterations = 0;
		this.setInput(output);
	}

	setInput(inputValue: string): void {
		this.strip.setInput(inputValue);
		this.caret.resetPosition();
		this.state = this.initial_state;
	}

	getCurrentCellValue(): string {
		return this.caret.read();
	}

	getNextTransitionIndex(): number {
		if (!this.stop) {
			let configuration = this.configuration;
			for (let [i, transition] of this.transitions.entries()) {
				if (transition.condition.equals(configuration)) {
					return i;
				}
			}
		}
		return -1;
	}

	getNextTransition(): TuringTransition {
		let index = this.getNextTransitionIndex();
		return index >= 0 ? this.transitions[index] : null;
	}

	getCurrentState(): string {
		return this.state;
	}

	private setState(new_state: string): void {
		//@todo validate state
		this.state = new_state;
		if (this.state === TuringMachine.stop_state)
			this.stop = true; 
	}

	step(): void {
		let transition = this.getNextTransition();
		if (transition) {
			if (transition.isPassive()) {
				throw `Passive transition found at runtime`;
			}
			this.caret.write(transition.command.input);
			this.caret.move(transition.command.move_dir);
			this.setState(transition.command.new_state);
			this.iterations += 1;

			let options: { max_iterations: number, max_strip_length: number } = {  // @todo move to machine options
				max_iterations: 1000,
				max_strip_length: 100
			};
			if (this.iterations > options.max_iterations) {
				throw `Maximum iterations exceeded: ${options.max_iterations}`;
			}
			if (this.strip.getLength() > options.max_strip_length) {
				throw `Maximum strip length exceeded: ${options.max_strip_length}`;
			}
			return;
		}
		throw `Configuration (${this.getCurrentState()},${this.getCurrentCellValue()}) not found!`;
	}

	isStopped(): boolean {
		return this.stop;
	}

	getStrip(): TuringMachineStrip {
		return this.strip;
	}

	getOutput(): string {
		return this.stop ? this.strip.getOutput() : null;
	}
}
