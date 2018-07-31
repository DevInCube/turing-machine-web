declare var ace: any;
import $ from 'jquery';

import { fromEvent } from 'rxjs';

import { TuringMachine } from './TuringMachine';
import { TuringMachineCanvas } from './TuringMachineCanvas';
import { tasks } from './tasks';
import { TuringTransitionError, TuringTransitionErrorType, getErrors, parseTransitions } from './parsing';
import { VisStateGraph } from './VisStateGraph';
import { TransitionsTable, TransitionsConstructorTable } from './TransitionsTable';

let set_btn = document.getElementById('set_btn');
let reset_btn = document.getElementById('reset_btn');
let rerun_btn = document.getElementById('reset_and_run_btn');
let step_btn = document.getElementById('step_btn');
let run_btn = document.getElementById('run_btn');
let input_el = document.getElementById('input');
let tasks_el = document.getElementById('tasks-list');
let error_counter = document.getElementById('error-counter');
let warn_counter = document.getElementById('warn-counter');
//---------------------------------------
let editor = ace.edit("algo");
let machine: TuringMachine | null = null;
let machineCanvas: TuringMachineCanvas | null = null;
let previewTransitionsTable = new TransitionsTable(<HTMLTableElement>document.getElementById('commands'));
let runtimeTransitionsTable = new TransitionsTable(<HTMLTableElement>document.getElementById('commands-run'));
let constructorTable = new TransitionsConstructorTable(<HTMLTableElement>document.getElementById('table-constructor'), tableToAlgo)
let previewGraph = new VisStateGraph(document.getElementById('preview-graph') as HTMLElement);
let runtimeGraph = new VisStateGraph(document.getElementById('runtime-graph') as HTMLElement, { interactive: false });

init();

function init() {
	editor.setShowInvisibles(true);
	editor.$blockScrolling = Infinity;

	fromEvent(editor, 'input')
		// .debounce(200) @todo how to import this?
		.subscribe(() => {
			let programText = editor.getValue();
			let transitionParseList = parseTransitions(programText);
			let errors = getErrors(transitionParseList);
			$(set_btn as HTMLElement).prop('disabled', errors.filter(x => x.type === TuringTransitionErrorType.Error).length !== 0);
			updateErrorsView(errors);
			let transitions = transitionParseList
				.filter(x => !x.error)
				.map(x => x.transition);
			previewTransitionsTable.update(transitions);
			previewGraph.update(transitions);
			constructorTable.update(transitions);
		});

	let turingMachineCanvasEl = <HTMLCanvasElement>document.getElementById('canvas');

	function initMachineCanvas() {
		machineCanvas = new TuringMachineCanvas(turingMachineCanvasEl);
		machineCanvas.draw();
	}

	onResize(turingMachineCanvasEl, initMachineCanvas);
	initMachineCanvas();

	// table

	$('#add-row').on('click', userAddRow);
	$('#add-col').on('click', userAddCol);
	$('#rem-row').on('click', userRemRow);
	$('#rem-col').on('click', userRemCol);

	$(set_btn as HTMLElement).on('click', setupMachine);
	$(step_btn as HTMLElement).on('click', stepMachine);
	$(run_btn as HTMLElement).on('click', runMachine);
	$(reset_btn as HTMLElement).on('click', resetMachine);
	$(rerun_btn as HTMLElement).on('click', () => {
		resetMachine();
		runMachine();
	});

	// tasks
	initTasks();
	setTask('replace1');

	$('#loading').hide();
	$('#app').show();
}

function initTasks() {
	for (let [task_id, task] of Object.entries(tasks)) {
		var item = document.createElement('li');
		var link = document.createElement('a');
		link.setAttribute('task_id', task_id);
		link.setAttribute('href', '#');
		link.innerHTML = `${task_id} - ${task.memo}`;
		link.addEventListener('click', onTaskLinkClick);
		item.appendChild(link);
		(tasks_el as HTMLElement).appendChild(item);
	}
}

function setTask(task_id: string) {
	var task = tasks[task_id];
	let algo_text = task.program;
	$(input_el as HTMLElement).val(task.input);
	editor.setValue(algo_text, 1);
}

function onTaskLinkClick(e: MouseEvent): void {
	let task_id = (<HTMLElement>e.target).getAttribute('task_id');
	setTask(task_id as string);
	$(set_btn as HTMLElement).click();
}

// machine

function setupMachine(): void {
	setRuntimeError();
	let algo_text = editor.getValue();
	let inputWord = ($(input_el as HTMLElement).val() as string).toString();
	let parseInfoList = parseTransitions(algo_text);
	let errors = getErrors(parseInfoList);
	if (errors.filter(x => x.type === "error").length === 0) {
		let transitions = parseInfoList.map(x => x.transition);
		let stateNames = uniq(transitions.map(x => x.condition.state)).sort();
		machine = new TuringMachine(stateNames, stateNames[0], transitions);
		machine.setInput(inputWord);

		(machineCanvas as TuringMachineCanvas).setMachine(machine);
		runtimeTransitionsTable.update(transitions);
		runtimeGraph.update(transitions);
		updateMachineViews();

		for (let btn of [step_btn, run_btn, reset_btn, rerun_btn]) {
			$(btn as HTMLElement).prop('disabled', false);
		}
	}
}

function resetMachine(): void {
	if (machine) {
		setRuntimeError();
		machine.reset();
		updateMachineViews();
	}
}

function stepMachine(): void {
	if (machine) {
		setRuntimeError();
		if (!machine.isStopped()) {
			try {
				machine.step();
			} catch (runTimeError) {
				setRuntimeError(runTimeError)
			}
		}
		updateMachineViews();
	}
}

function runMachine(): void {
	if (machine) {
		setRuntimeError();
		while (!machine.isStopped()) {
			try {
				machine.step();
			} catch (runTimeError) {
				setRuntimeError(runTimeError)
				break;
			}
		}
		updateMachineViews();
	}
}

function updateMachineViews(): void {
	if (!machineCanvas || !machine) { return; }
	machineCanvas.draw();
	runtimeGraph.setActiveState(machine.getCurrentState());
	runtimeTransitionsTable.setNextTransition(machine.getNextTransitionIndex());
	$(step_btn as HTMLElement).prop('disabled', machine.isStopped());
	$(run_btn as HTMLElement).prop('disabled', machine.isStopped());
}

// errors

function setRuntimeError(errorMessage: string = '') {
	$('#run-error').html(errorMessage);
}

function updateErrorsView(errors: TuringTransitionError[]) {
	let errorsEl = $('#trans-errors');
	errorsEl.empty();
	for (let error of errors) {
		let lbl = error.type.toString();
		if (lbl === 'error') lbl = 'danger';
		errorsEl.append(`<tr><td>. <span class='label label-${lbl}'>${error.type}</span></td><td>${error.line || ''}</td><td>${error.text}</td></tr>`);
	}
	let errorsCount = errors.filter(x => x.type === TuringTransitionErrorType.Error).length;
	const counterEl = $(error_counter as HTMLElement);
	counterEl.text(errorsCount);
	if (errorsCount > 0) {
		counterEl.show();
	} else {
		counterEl.hide();
	}
	let warnCount = errors.filter(x => x.type === TuringTransitionErrorType.Warning).length;
	const warnCounterEl = $(warn_counter as HTMLElement);
	warnCounterEl.text(warnCount);
	if (warnCount > 0) {
		warnCounterEl.show();
	} else {
		warnCounterEl.hide();
	}
	let totalLines = editor.session.doc.getAllLines().length;
	editor.getSession().setAnnotations(errors.map(error => ({
		row: error.line ? error.line - 1 : totalLines - 1,
		column: 0,
		text: error.text,
		type: error.type
	})));
}

// table 

function tableToAlgo(): void {
	editor.setValue(constructorTable.getProgramFromTable(), 1);
}

function userAddRow() {
	constructorTable.appendRow();
	tableToAlgo();
}

function userAddCol() {
	constructorTable.appendColumn();
	tableToAlgo();
}

function userRemRow() {
	constructorTable.removeLastRow();
	tableToAlgo();
}

function userRemCol() {
	constructorTable.removeLastColumn();
	tableToAlgo();
}

// utils

function uniq(a: string[]) {
	var seen: { [id: string]: boolean } = {};
	return a.filter(function (item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
}

function onResize(element: HTMLCanvasElement, callback: () => void) {
	var elementHeight = element.height,
		elementWidth = element.width;
	setInterval(function () {
		if (element.height !== elementHeight || element.width !== elementWidth) {
			elementHeight = element.height;
			elementWidth = element.width;
			callback();
		}
	}, 300);
}