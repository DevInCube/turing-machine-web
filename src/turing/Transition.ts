export class TuringCondition {
	constructor(readonly state: string, readonly value: string) {
	}

	public equals(obj: TuringCondition): boolean {
		return this.state === obj.state && this.value === obj.value;
	}
};

export enum MoveDirection {
	None = "N",
	Left = "L",
	Right = "R"
};

export class TuringCommand {
	constructor(readonly input: string, readonly move_dir: MoveDirection, readonly new_state: string) {
	}
};

export class TuringTransition {
	constructor(readonly condition: TuringCondition, readonly command: TuringCommand) {
	}

	isPassive(): boolean {
		return this.command.input === this.condition.value
			&& this.command.move_dir === MoveDirection.None
			&& this.command.new_state === this.condition.state;
	}
};
