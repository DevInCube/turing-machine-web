import {TuringMachine} from './TuringMachine'
import {MoveDirection, TuringCommand, TuringCondition, TuringTransition} from './Transition'

export enum TuringTransitionErrorType {
	Error = "error",
	Warning = "warning",
	Information = "information"
}

export class TuringTransitionError {
	type: TuringTransitionErrorType;
	text: string;
	line?: number;
	raw?: string;

	constructor(text: string, options: { type?: TuringTransitionErrorType, line?: number, raw?: string } = {}) {
		this.text = text;
		this.type = options.type || TuringTransitionErrorType.Error;
		this.line = options.line;
		this.raw = options.raw;
	}
}

export class TuringTransitionParseInfo {
	transition: TuringTransition;
	raw: string;
	line: number;
	error: string;

	constructor(transition: TuringTransition, { raw, line, error }: { raw: string, line: number, error: string }) {
		this.transition = transition;
		this.raw = raw;
		this.line = line;
		this.error = error;
	}
};

// @todo 'expand' program from syntactic sugar and do checks on expanded transitions
export function getErrors(transitionParseInfoList: TuringTransitionParseInfo[]): TuringTransitionError[] {
	let errors: TuringTransitionError[] = [];
	if (transitionParseInfoList.length === 0) {
		errors.push(new TuringTransitionError(`Empty program`));
		return errors;
	}
	let states: { [id: string]: { to: number, from: number, first?: boolean, line?: number } } = {};
	states[''] = { to: 1, from: 1 };  // @todo remove in expanded
	states[TuringMachine.stop_state] = { to: 0, from: 1 };
	for (let info of transitionParseInfoList.filter(x => x.error)) {
		errors.push(new TuringTransitionError(info.error, { line: info.line, raw: info.raw }));
    }
    let first = true;
	transitionParseInfoList = transitionParseInfoList.filter(x => !x.error);
	for (let info of transitionParseInfoList) {
		let t = info.transition;
		if (t.condition.state) {
			if (!states[t.condition.state]) {
				states[t.condition.state] = { to: 0, from: 0, first, line: info.line };
			}
			states[t.condition.state].from++;
			first = false;
		}
		if (t.command.new_state) {
			if (!states[t.command.new_state]) {
				states[t.command.new_state] = { to: 0, from: 0, first, line: info.line };
			}
			states[t.command.new_state].to++;
			first = false;
		}
	}

	let hashes: { [id: string]: { dup: number, first: number } } = {};
	for (let tInfo of transitionParseInfoList) {
		let t = tInfo.transition;
		if ((!t.command.input || t.command.input === t.condition.value) &&
			(!t.command.move_dir || t.command.move_dir === MoveDirection.None as MoveDirection) &&
			(!t.command.new_state || t.command.new_state === t.condition.state)) {
			errors.push(new TuringTransitionError(`Passive command will lock the machine in infinite loop`, { type: TuringTransitionErrorType.Warning, line: tInfo.line }));
		}
		//
		// to find duplicates
		let hashValue = `${t.condition.state},${t.condition.value}`;
		if (!hashes[hashValue]) {
			hashes[hashValue] = { dup: -1, first: tInfo.line };
		} else {
			if (hashes[hashValue].dup === -1) {
				hashes[hashValue].dup = tInfo.line;
			}
		}
	}
	for (let hashValue in hashes) {
		let info = hashes[hashValue];
		if (info.dup !== -1) {
			errors.push(new TuringTransitionError(`Condition '${hashValue}' duplicate found. First occurence on line ${info.first}`, { line: info.dup }));
		}
	}
	for (let state in states) {
		let info = states[state];
		if (!info.first && info.to === 0) {
			errors.push(new TuringTransitionError(`Transition to state (${state}) is missing`, { type: TuringTransitionErrorType.Warning, line: info.line }));
		}
		if (info.from === 0) {
			errors.push(new TuringTransitionError(`State (${state}) is not defined`, { line: info.line }));
		}
	}
	return errors;
}

//

function stringToMoveDirection(str: string): MoveDirection {
	switch (str) {
		case 'L': return MoveDirection.Left;
		case 'R': return MoveDirection.Right;
		case 'N': return MoveDirection.None;
		default: throw `Unsupported move direction: ${str}`;
	}
}

enum ParseState {
	ConditionState,
	ConditionValue,
	CommandNewValue,
	CommandMove,
	CommandNewState,
	Arrow
};

/// q0,a->d,L,q1
function parseTransition(str: string): TuringTransition {

	var cond_state = '';
	var cond_value = '';
	var input = '';
	var move = '';
	var new_state = '';

	var state = ParseState.ConditionState;

	for (let [i, char] of str.split('').entries()) {
		let eof = i === str.length - 1;
		switch (state) {
			case ParseState.ConditionState:
				if (/\s/.test(char)) throw 'Whitespace characters are not allowed condition state names';
				else if (char === ',') state = ParseState.ConditionValue;
				else cond_state += char;
				if (eof) throw 'Incomplete transition: comma and condition symbol expected';
				break;
			case ParseState.ConditionValue:
				if (char === ',') throw 'Comma is not allowed as condition symbol character';
				else if (char === '-') state = ParseState.Arrow;
				else cond_value += char;
				if (cond_value.length === 0) throw 'Empty condition symbols are not allowed';
				if (cond_value.length > 1) throw `Condition symbol should have only one character: '${cond_value}'`;
				if (eof) throw `Incomplete transition: arrow '->' expected`;
				break;
			case ParseState.Arrow:
				if (char === '>') state = ParseState.CommandNewValue;
				else throw `'>' character was expected after '-'. Got '${char}'`;
				if (eof) throw 'Incomplete transition: replace symbol expected';
				break;
			case ParseState.CommandNewValue:
				if (char === ',') state = ParseState.CommandMove;
				else input += char;
				if (input.length > 1) throw `Replace symbol should have only one character: '${input}'`;
				if (eof) throw 'Incomplete transition: caret move expected';
				break;
			case ParseState.CommandMove:
				if (char === ',') state = ParseState.CommandNewState;
				else move += char;
				if (move.length > 1 || !'LNR'.includes(move)) throw `Invalid caret move: '${move}'. Expected: 'L', 'R', 'N' or empty`;
				break;
			case ParseState.CommandNewState:
				if (char === ',' || /\s/.test(char)) throw 'Whitespace characters and comma are not allowed in new state names';
				else new_state += char;
				break;
		}
	}

	var condition = new TuringCondition(cond_state, cond_value);
	var command = new TuringCommand(input || cond_value, stringToMoveDirection(move || "N"), new_state || cond_state);
	return new TuringTransition(condition, command);
}

export function parseTransitions(text: string): TuringTransitionParseInfo[] {
	let transitions = [];
	for (let [lineIndex, line] of text.replace(/\r/g, '').split('\n').entries()) {
		if (line === '') continue;
		let error;
		let transition;
		try {
			transition = parseTransition(line);
		} catch (err) {
			error = err;
		}
		transitions.push(new TuringTransitionParseInfo(transition, { raw: line, line: lineIndex + 1, error }));
	}
	return transitions;
}