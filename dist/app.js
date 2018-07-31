System.register("Transition", [], function (exports_1, context_1) {
    var __moduleName = context_1 && context_1.id;
    var TuringCondition, MoveDirection, TuringCommand, TuringTransition;
    return {
        setters: [],
        execute: function () {
            TuringCondition = class TuringCondition {
                constructor(state, value) {
                    this.state = state;
                    this.value = value;
                }
                equals(obj) {
                    return this.state === obj.state && this.value === obj.value;
                }
            };
            exports_1("TuringCondition", TuringCondition);
            ;
            (function (MoveDirection) {
                MoveDirection["None"] = "N";
                MoveDirection["Left"] = "L";
                MoveDirection["Right"] = "R";
            })(MoveDirection || (MoveDirection = {}));
            exports_1("MoveDirection", MoveDirection);
            ;
            TuringCommand = class TuringCommand {
                constructor(input, move_dir, new_state) {
                    this.input = input;
                    this.move_dir = move_dir;
                    this.new_state = new_state;
                }
            };
            exports_1("TuringCommand", TuringCommand);
            ;
            TuringTransition = class TuringTransition {
                constructor(condition, command) {
                    this.condition = condition;
                    this.command = command;
                }
                isPassive() {
                    return this.command.input === this.condition.value
                        && this.command.move_dir === MoveDirection.None
                        && this.command.new_state === this.condition.state;
                }
            };
            exports_1("TuringTransition", TuringTransition);
            ;
        }
    };
});
System.register("TransitionsTable", ["Transition", "jquery"], function (exports_2, context_2) {
    var __moduleName = context_2 && context_2.id;
    // utils
    function uniq(a) {
        var seen = {};
        return a.filter(function (item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }
    var Transition_1, jquery_1, TransitionsConstructorTable, TransitionsTable;
    return {
        setters: [
            function (Transition_1_1) {
                Transition_1 = Transition_1_1;
            },
            function (jquery_1_1) {
                jquery_1 = jquery_1_1;
            }
        ],
        execute: function () {
            TransitionsConstructorTable = class TransitionsConstructorTable {
                constructor(table, inputHandler) {
                    this.table = table;
                    this.inputHandler = inputHandler;
                    jquery_1.default(table)
                        .append(jquery_1.default('<tr>')
                        .append(jquery_1.default('<td>'))
                        .append(jquery_1.default('<td>').append(jquery_1.default('<input>').addClass('init-cell').attr('type', 'text'))))
                        .append(jquery_1.default('<tr>')
                        .append(jquery_1.default('<td>').append(jquery_1.default('<input>').addClass('init-cell').attr('type', 'text')))
                        .append(jquery_1.default('<td>').append(jquery_1.default('<input>').addClass('init-cell').attr('type', 'text'))));
                    for (let cell of jquery_1.default('.init-cell')) {
                        cell.addEventListener('input', this.inputHandler);
                    }
                }
                appendRow() {
                    var colsLen = this.table.rows[0].cells.length;
                    var row = this.table.insertRow(this.table.rows.length);
                    for (var i = 0; i < colsLen; i++) {
                        var cell = row.insertCell(0);
                        let input = document.createElement('input');
                        input.setAttribute('type', 'text');
                        input.addEventListener('input', this.inputHandler);
                        cell.appendChild(input);
                    }
                }
                appendColumn() {
                    var colsLen = this.table.rows[0].cells.length;
                    for (var i = 0; i < this.table.rows.length; i++) {
                        var row = this.table.rows[i];
                        var cell = row.insertCell(colsLen);
                        let input = document.createElement('input');
                        input.setAttribute('type', 'text');
                        input.addEventListener('input', this.inputHandler);
                        cell.appendChild(input);
                    }
                }
                removeLastRow() {
                    if (this.table.rows.length > 2) {
                        for (let cell of [].slice.call(this.table.rows[this.table.rows.length - 1].cells)) {
                            cell.removeEventListener('input', this.inputHandler);
                        }
                        this.table.deleteRow(this.table.rows.length - 1);
                    }
                }
                removeLastColumn() {
                    var colsLen = this.table.rows[0].cells.length;
                    if (colsLen > 2) {
                        for (var i = 0; i < this.table.rows.length; i++) {
                            var row = this.table.rows[i];
                            let cell = row.cells[colsLen - 1];
                            cell.removeEventListener('input', this.inputHandler);
                            row.deleteCell(colsLen - 1);
                        }
                    }
                }
                getProgramFromTable() {
                    var re = /_/g;
                    var programText = '';
                    var colsLen = this.table.rows[0].cells.length;
                    for (var i = 1; i < this.table.rows.length; i++) {
                        var state = this.table.rows[i].cells[0].children[0].value;
                        for (var j = 1; j < colsLen; j++) {
                            var inputSym = this.table.rows[0].cells[j].children[0].value;
                            var value = this.table.rows[i].cells[j].children[0].value;
                            if (value) {
                                programText += `${state},${inputSym}->${value.trim()}`.replace(re, ' ') + "\n";
                            }
                        }
                    }
                    return programText;
                }
                createTable(width, height) {
                    while (this.table.rows.length > 2) {
                        this.removeLastRow();
                    }
                    while (this.table.rows[0].cells.length > 2) {
                        this.removeLastColumn();
                    }
                    this.setTableCellValue(0, 1, '');
                    this.setTableCellValue(1, 0, '');
                    this.setTableCellValue(1, 1, '');
                    while (this.table.rows.length < height + 1)
                        this.appendRow();
                    while (this.table.rows[0].cells.length < width + 1)
                        this.appendColumn();
                }
                setTableCellValue(i, j, value) {
                    this.table.rows[i].cells[j].children[0].value = value;
                }
                update(transitions) {
                    let symbols = uniq(transitions.map(x => x.condition.value)).sort();
                    let states = uniq(transitions.map(x => x.condition.state)).sort();
                    this.createTable(symbols.length, states.length);
                    for (let i = 0; i < states.length + 1; i++) {
                        for (let j = 0; j < symbols.length + 1; j++) {
                            if (i === 0 && j === 0)
                                continue;
                            let state = '';
                            let value = '';
                            if (i > 0)
                                state = states[i - 1];
                            if (j > 0)
                                value = symbols[j - 1];
                            if (i === 0 && j > 0) {
                                if (value === ' ')
                                    value = '_';
                                this.setTableCellValue(i, j, value);
                            }
                            if (j === 0 && i > 0) {
                                this.setTableCellValue(i, j, state);
                            }
                            if (i > 0 && j > 0) {
                                let transition = getTransition(state, value);
                                if (transition) {
                                    let input = (transition.command.input === ' ') ? "_" : transition.command.input;
                                    let move = (transition.command.move_dir) ? transition.command.move_dir.toString() : '';
                                    let transitionCommand = `${input},${move},${transition.command.new_state}`;
                                    this.setTableCellValue(i, j, transitionCommand);
                                }
                            }
                        }
                    }
                    function getTransition(_state, _value) {
                        for (let trans of transitions) {
                            if (trans.condition.state === _state &&
                                trans.condition.value === _value) {
                                return trans;
                            }
                        }
                        return undefined;
                    }
                }
            };
            exports_2("TransitionsConstructorTable", TransitionsConstructorTable);
            TransitionsTable = class TransitionsTable {
                constructor(table) {
                    this.table = table;
                }
                update(transitions) {
                    let transitions_table_id = this.table.getAttribute('id');
                    jquery_1.default(this.table).empty();
                    for (let [i, t] of transitions.entries()) {
                        let row = jquery_1.default('<tr>').attr('id', transitions_table_id + '_' + i)
                            .append(jquery_1.default('<td>').append(i.toString()))
                            .append(jquery_1.default('<td>').html(`(${t.condition.state})`))
                            .append(jquery_1.default('<td>').html(`'${t.condition.value}'`))
                            .append(jquery_1.default('<td>').html('—>'))
                            .append(jquery_1.default('<td>').html(`'${t.command.input}'`))
                            .append(jquery_1.default('<td>').html(this.moveDirectionToString(t.command.move_dir)))
                            .append(jquery_1.default('<td>').html(`(${t.command.new_state})`));
                        jquery_1.default(this.table).append(jquery_1.default(row));
                    }
                }
                moveDirectionToString(move_dir) {
                    switch (move_dir) {
                        case Transition_1.MoveDirection.Left: return '<- L';
                        case Transition_1.MoveDirection.Right: return 'R ->';
                        default: return 'N';
                    }
                }
                setNextTransition(index) {
                    for (let row of [].slice.call(this.table.rows)) {
                        jquery_1.default(row).removeClass('active');
                    }
                    if (index >= 0) {
                        jquery_1.default(this.table.rows[index]).addClass('active');
                        jquery_1.default(this.table).removeClass('commands-error');
                    }
                    else {
                        jquery_1.default(this.table).addClass('commands-error');
                    }
                }
            };
            exports_2("TransitionsTable", TransitionsTable);
        }
    };
});
System.register("TuringMachine", ["Transition"], function (exports_3, context_3) {
    var __moduleName = context_3 && context_3.id;
    var Transition_2, TuringMachineCaret, TuringMachineStrip, TuringMachine;
    return {
        setters: [
            function (Transition_2_1) {
                Transition_2 = Transition_2_1;
            }
        ],
        execute: function () {
            TuringMachineCaret = class TuringMachineCaret {
                constructor(strip) {
                    this.strip = strip;
                }
                write(symbolValue) {
                    this.strip.write(this.position, symbolValue);
                }
                read() {
                    return this.strip.read(this.position);
                }
                move(dir) {
                    this.position = this.strip.pre_expand(dir, this.position);
                    switch (dir) {
                        case Transition_2.MoveDirection.Left: {
                            this.position -= 1;
                            break;
                        }
                        case Transition_2.MoveDirection.Right: {
                            this.position += 1;
                            break;
                        }
                        case Transition_2.MoveDirection.None:
                            break;
                        default:
                            throw `'${dir}' is not a valid caret move direction`;
                    }
                    this.position = this.strip.post_expand(dir, this.position);
                }
                getPosition() {
                    return this.position;
                }
                resetPosition() {
                    this.position = 1;
                }
            };
            exports_3("TuringMachineCaret", TuringMachineCaret);
            TuringMachineStrip = class TuringMachineStrip {
                constructor() {
                    this.cells = [
                        TuringMachineStrip.empty_symbol,
                        TuringMachineStrip.empty_symbol,
                        TuringMachineStrip.empty_symbol
                    ];
                }
                read(index) {
                    return this.cells[index];
                }
                write(index, value) {
                    this.cells[index] = value;
                }
                pre_expand(dir, index) {
                    switch (dir) {
                        case Transition_2.MoveDirection.Left: {
                            if ((index == this.cells.length - 2)
                                && (this.cells[index] == TuringMachineStrip.empty_symbol)) {
                                this.cells.pop();
                            }
                            break;
                        }
                        case Transition_2.MoveDirection.Right: {
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
                post_expand(dir, index) {
                    switch (dir) {
                        case Transition_2.MoveDirection.Left: {
                            if (index == 0) {
                                this.cells.unshift(TuringMachineStrip.empty_symbol);
                                return 1;
                            }
                            break;
                        }
                        case Transition_2.MoveDirection.Right: {
                            if (index == this.cells.length - 1)
                                this.cells.push(TuringMachineStrip.empty_symbol);
                            break;
                        }
                    }
                    return index;
                }
                setInput(inputValue) {
                    this.cells = inputValue.split('');
                    this.cells.unshift(TuringMachineStrip.empty_symbol);
                    this.cells.push(TuringMachineStrip.empty_symbol);
                }
                getOutput() {
                    let output = '';
                    for (let cellVal of this.cells.filter(x => x != TuringMachineStrip.empty_symbol)) {
                        output += cellVal;
                    }
                    return output;
                }
                getLength() {
                    return this.cells.length;
                }
            };
            TuringMachineStrip.empty_symbol = ' ';
            exports_3("TuringMachineStrip", TuringMachineStrip);
            //=============================================================
            TuringMachine = class TuringMachine {
                constructor(states, initial_state, transitions) {
                    this.states = states;
                    this.initial_state = initial_state;
                    this.transitions = transitions;
                    this.strip = new TuringMachineStrip();
                    this.caret = new TuringMachineCaret(this.strip);
                    this.stop = false;
                    this.iterations = 0;
                    this.setState(this.initial_state);
                }
                get configuration() {
                    return new Transition_2.TuringCondition(this.state, this.getCurrentCellValue());
                }
                get strip_cells() {
                    return this.strip.cells;
                }
                get caret_position() {
                    return this.caret.getPosition();
                }
                reset() {
                    let output = this.strip.getOutput();
                    this.stop = false;
                    this.iterations = 0;
                    this.setInput(output);
                }
                setInput(inputValue) {
                    this.strip.setInput(inputValue);
                    this.caret.resetPosition();
                    this.state = this.initial_state;
                }
                getCurrentCellValue() {
                    return this.caret.read();
                }
                getNextTransitionIndex() {
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
                getNextTransition() {
                    let index = this.getNextTransitionIndex();
                    return index >= 0 ? this.transitions[index] : undefined;
                }
                getCurrentState() {
                    return this.state;
                }
                setState(new_state) {
                    //@todo validate state
                    this.state = new_state;
                    if (this.state === TuringMachine.stop_state)
                        this.stop = true;
                }
                step() {
                    let transition = this.getNextTransition();
                    if (transition) {
                        if (transition.isPassive()) {
                            throw `Passive transition found at runtime`;
                        }
                        this.caret.write(transition.command.input);
                        this.caret.move(transition.command.move_dir);
                        this.setState(transition.command.new_state);
                        this.iterations += 1;
                        let options = {
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
                isStopped() {
                    return this.stop;
                }
                getStrip() {
                    return this.strip;
                }
                getOutput() {
                    return this.stop ? this.strip.getOutput() : undefined;
                }
            };
            TuringMachine.stop_state = '!';
            exports_3("TuringMachine", TuringMachine);
        }
    };
});
System.register("TuringMachineCanvas", ["TuringMachine"], function (exports_4, context_4) {
    var __moduleName = context_4 && context_4.id;
    var TuringMachine_1, TuringMachineCanvas;
    return {
        setters: [
            function (TuringMachine_1_1) {
                TuringMachine_1 = TuringMachine_1_1;
            }
        ],
        execute: function () {
            TuringMachineCanvas = class TuringMachineCanvas {
                constructor(canvas) {
                    this.canvas = canvas;
                    this.machine = null;
                    this.canvas.style.width = '100%';
                    this.canvas.width = this.canvas.offsetWidth;
                    this.canvas.height = 200;
                    this.ctx = this.canvas.getContext('2d');
                    this.font_size = 32;
                }
                setMachine(machine) {
                    this.machine = machine;
                }
                draw() {
                    this.canvas.width = this.canvas.width;
                    var width = this.canvas.width;
                    var height = this.canvas.height;
                    var input_word = this.machine ? this.machine.strip_cells : [' '];
                    var caret_position = this.machine ? this.machine.caret_position : 0;
                    var is_stopped = !this.machine || this.machine.isStopped();
                    let state_id = this.machine ? this.machine.getCurrentState() : TuringMachine_1.TuringMachine.stop_state;
                    var length = input_word.length;
                    if (length > 10) {
                        TuringMachineCanvas.cell_size = 40 - (length - 10) * 0.5;
                        if (TuringMachineCanvas.cell_size < 10)
                            TuringMachineCanvas.cell_size = 10;
                        this.font_size = 32 - (length - 10) * 0.5;
                        if (this.font_size < 12)
                            this.font_size = 12;
                    }
                    else {
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
                drawStrip(x, middle_y, input_word) {
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
                drawEmptyCell(x, y, size, opacity) {
                    var ctx = this.ctx;
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
                drawStripCell(x, y, value) {
                    this.drawEmptyCell(x, y, TuringMachineCanvas.cell_size, 1);
                    var ctx = this.ctx;
                    ctx.fillStyle = '#000000';
                    ctx.font = `${this.font_size}px Consolas`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    var text_size = ctx.measureText(value);
                    ctx.fillText(value, x + (TuringMachineCanvas.cell_size - text_size.width) / 2, y + (TuringMachineCanvas.cell_size - this.font_size) / 2);
                }
                drawCaretBack(x, y, isStopped) {
                    var ctx = this.ctx;
                    ctx.fillStyle = isStopped ? '#ffcccc' : '#ccccff';
                    ctx.fillRect(x, y, TuringMachineCanvas.cell_size, TuringMachineCanvas.cell_size * 3);
                }
                drawCurrentState(x, y, stateId) {
                    var ctx = this.ctx;
                    ctx.fillStyle = '#000000';
                    var font_size = this.font_size - 10;
                    ctx.font = `${font_size}px Consolas bold`;
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    var text_size = ctx.measureText(stateId);
                    ctx.fillText(stateId, x + (TuringMachineCanvas.cell_size - text_size.width) / 2, y + (TuringMachineCanvas.cell_size - font_size) / 2);
                }
                drawCaretFront(x, y) {
                    var ctx = this.ctx;
                    ctx.beginPath();
                    ctx.lineWidth = TuringMachineCanvas.cell_border * 2;
                    ctx.strokeStyle = "black";
                    ctx.rect(x, y + TuringMachineCanvas.cell_size, TuringMachineCanvas.cell_size, TuringMachineCanvas.cell_size);
                    ctx.stroke();
                }
            };
            TuringMachineCanvas.cell_size = 40;
            TuringMachineCanvas.cell_border = 2;
            exports_4("TuringMachineCanvas", TuringMachineCanvas);
        }
    };
});
System.register("VisStateGraph", ["vis", "TuringMachine"], function (exports_5, context_5) {
    var __moduleName = context_5 && context_5.id;
    function transitionsToStateGraph(transitions) {
        var stateGraph = {
            [TuringMachine_2.TuringMachine.stop_state]: []
        };
        for (let transition of transitions) {
            var state = transition.condition.state;
            if (!stateGraph.hasOwnProperty(state))
                stateGraph[state] = [];
            stateGraph[state].push(transition);
        }
        return stateGraph;
    }
    function stateGraphToVisNetworkData(stateGraph) {
        var nodes = [];
        var edges = [];
        for (let stateId in stateGraph) {
            let netNode = {
                id: stateId,
                label: stateId,
                font: {
                    size: 18,
                },
                color: {
                    highlight: { background: 'yellow' },
                    background: stateId == TuringMachine_2.TuringMachine.stop_state ? '#faa' : 'lightsteelblue'
                },
                fixed: stateId == TuringMachine_2.TuringMachine.stop_state
            };
            nodes.push(netNode);
            let self_count = 10;
            for (let edge of stateGraph[stateId]) {
                if (edge.command.new_state == stateId)
                    self_count += 10;
                let text = `'${edge.condition.value}'/'${edge.command.input}',${edge.command.move_dir}`;
                let netEdge = {
                    id: stateId + text,
                    from: stateId,
                    to: edge.command.new_state,
                    label: text,
                    title: text,
                    arrows: "to",
                    selfReferenceSize: self_count
                };
                edges.push(netEdge);
            }
        }
        return {
            nodes: new vis_1.default.DataSet(nodes),
            edges: new vis_1.default.DataSet(edges)
        };
    }
    function getVisNetworkOptions() {
        var options = {
            nodes: {
                color: {
                    border: 'steelblue',
                },
                font: {
                    face: 'consolas'
                }
            },
            physics: {
                enabled: true,
                repulsion: {
                    centralGravity: 0,
                    springConstant: 0.2,
                    damping: 0.3,
                },
                solver: 'repulsion',
            },
            edges: {
                color: {
                    color: 'steelblue',
                    highlight: 'lightsteelblue',
                },
                font: {
                    face: 'consolas'
                },
                length: 200,
                smooth: {
                    enabled: true,
                    type: 'dynamic',
                },
            },
            layout: {
                randomSeed: 0,
                hierarchical: { enabled: false, }
            }
        };
        return options;
    }
    var vis_1, TuringMachine_2, VisStateGraph;
    return {
        setters: [
            function (vis_1_1) {
                vis_1 = vis_1_1;
            },
            function (TuringMachine_2_1) {
                TuringMachine_2 = TuringMachine_2_1;
            }
        ],
        execute: function () {
            ;
            VisStateGraph = class VisStateGraph {
                constructor(container, options = { interactive: true }) {
                    this.container = container;
                    this.options = options;
                }
                update(transitions) {
                    let states = transitionsToStateGraph(transitions);
                    let data = stateGraphToVisNetworkData(states);
                    // create a network
                    let options = getVisNetworkOptions();
                    if (!this.options.interactive) {
                        options = Object.assign({}, getVisNetworkOptions(), {
                            interaction: {
                                dragNodes: false,
                                dragView: true,
                                selectable: false
                            }
                        });
                    }
                    this.network = new vis_1.default.Network(this.container, data, options);
                }
                setActiveState(state) {
                    this.network.selectNodes([state], false);
                }
            };
            exports_5("VisStateGraph", VisStateGraph);
        }
    };
});
System.register("tasks", [], function (exports_6, context_6) {
    var __moduleName = context_6 && context_6.id;
    var Task, tasks;
    return {
        setters: [],
        execute: function () {
            Task = class Task {
                constructor(input, output, program, memo) {
                    this.input = input;
                    this.output = output;
                    this.program = program;
                    this.memo = memo;
                }
            };
            exports_6("Task", Task);
            ;
            exports_6("tasks", tasks = {});
            tasks['empty'] = new Task(' ', ' ', 'q1, ->,,!', 'Пустий приклад');
            tasks['hello'] = new Task('hello.', 'HELLO!', 'q0,h->H,R,q0\nq0,e->E,R,q0\nq0,l->L,R,q0\nq0,o->O,R,q0\nq0,.->!,R,q1\nq1, -> ,L,!', 'Перевести всі букви у верхній регістр. Замінити точку на знак оклику.');
            tasks['inc10'] = new Task('199', '200', 'q0,0->,R,\nq0,1->,R,\nq0,2->,R,\nq0,3->,R,\nq0,4->,R,\nq0,5->,R,\nq0,6->,R,\nq0,7->,R,\nq0,8->,R,\nq0,9->,R,\nq0, ->,L,q1\nq1,0->1,,!\nq1,1->2,,!\nq1,2->3,,!\nq1,3->4,,!\nq1,4->5,,!\nq1,5->6,,!\nq1,6->7,,!\nq1,7->8,,!\nq1,8->9,,!\nq1,9->0,L,\nq1, ->1,,!', 'Інкрементувати число, що представлене в десятковій системі числення');
            tasks['replace1'] = new Task('abcb', 'bcba', 'q1,a-> ,R,q2\nq1,b-> ,R,q3\nq1,c-> ,R,q4\nq1, ->,R,\nq2,a->,R,\nq2,b->,R,\nq2,c->,R,\nq2, ->a,,!\nq3,a->,R,\nq3,b->,R,\nq3,c->,R,\nq3, ->b,,!\nq4,a->,R,\nq4,b->,R,\nq4,c->,R,\nq4, ->c,,!\n', 'Перенести перший символ в кінець послідовності');
            tasks['delete_a'] = new Task('bcbacba', 'bcbcba', 'q1,a-> ,R,!\nq1,b-> ,R,q2\nq1,c-> ,R,q3\nq1, ->,,!\nq2,a->b,R,!\nq2,b->,R,\nq2,c->b,R,q3\nq2, ->b,,!\nq3,a->c,,!\nq3,b->c,R,q2\nq3,c->,R,\nq3, ->c,,!', 'Видалити зі слова перше входження символа `a`, якщо таке є.');
            tasks['insert_a'] = new Task('bca', 'baca', 'q1,a->,L,q2\nq1,b->,L,q3\nq1,c->,L,q4\nq1, ->,,!\nq2, ->a,R,q5\nq3, ->b,R,q5\nq4, ->c,R,q5\nq5,a->,,!\nq5,b->a,,!\nq5,c->a,,!', 'Якщо слово непусте, то за його першим символом вставити символ `a`');
        }
    };
});
System.register("parsing", ["TuringMachine", "Transition"], function (exports_7, context_7) {
    var __moduleName = context_7 && context_7.id;
    // @todo 'expand' program from syntactic sugar and do checks on expanded transitions
    function getErrors(transitionParseInfoList) {
        let errors = [];
        if (transitionParseInfoList.length === 0) {
            errors.push(new TuringTransitionError(`Empty program`));
            return errors;
        }
        let states = {};
        states[''] = { to: 1, from: 1 }; // @todo remove in expanded
        states[TuringMachine_3.TuringMachine.stop_state] = { to: 0, from: 1 };
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
        let hashes = {};
        for (let tInfo of transitionParseInfoList) {
            let t = tInfo.transition;
            if ((!t.command.input || t.command.input === t.condition.value) &&
                (!t.command.move_dir || t.command.move_dir === Transition_3.MoveDirection.None) &&
                (!t.command.new_state || t.command.new_state === t.condition.state)) {
                errors.push(new TuringTransitionError(`Passive command will lock the machine in infinite loop`, { type: TuringTransitionErrorType.Warning, line: tInfo.line }));
            }
            //
            // to find duplicates
            let hashValue = `${t.condition.state},${t.condition.value}`;
            if (!hashes[hashValue]) {
                hashes[hashValue] = { dup: -1, first: tInfo.line };
            }
            else {
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
    exports_7("getErrors", getErrors);
    //
    function stringToMoveDirection(str) {
        switch (str) {
            case 'L': return Transition_3.MoveDirection.Left;
            case 'R': return Transition_3.MoveDirection.Right;
            case 'N': return Transition_3.MoveDirection.None;
            default: throw `Unsupported move direction: ${str}`;
        }
    }
    /// q0,a->d,L,q1
    function parseTransition(str) {
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
                    if (/\s/.test(char))
                        throw 'Whitespace characters are not allowed condition state names';
                    else if (char === ',')
                        state = ParseState.ConditionValue;
                    else
                        cond_state += char;
                    if (eof)
                        throw 'Incomplete transition: comma and condition symbol expected';
                    break;
                case ParseState.ConditionValue:
                    if (char === ',')
                        throw 'Comma is not allowed as condition symbol character';
                    else if (char === '-')
                        state = ParseState.Arrow;
                    else
                        cond_value += char;
                    if (cond_value.length === 0)
                        throw 'Empty condition symbols are not allowed';
                    if (cond_value.length > 1)
                        throw `Condition symbol should have only one character: '${cond_value}'`;
                    if (eof)
                        throw `Incomplete transition: arrow '->' expected`;
                    break;
                case ParseState.Arrow:
                    if (char === '>')
                        state = ParseState.CommandNewValue;
                    else
                        throw `'>' character was expected after '-'. Got '${char}'`;
                    if (eof)
                        throw 'Incomplete transition: replace symbol expected';
                    break;
                case ParseState.CommandNewValue:
                    if (char === ',')
                        state = ParseState.CommandMove;
                    else
                        input += char;
                    if (input.length > 1)
                        throw `Replace symbol should have only one character: '${input}'`;
                    if (eof)
                        throw 'Incomplete transition: caret move expected';
                    break;
                case ParseState.CommandMove:
                    if (char === ',')
                        state = ParseState.CommandNewState;
                    else
                        move += char;
                    if (move.length > 1 || !'LNR'.includes(move))
                        throw `Invalid caret move: '${move}'. Expected: 'L', 'R', 'N' or empty`;
                    break;
                case ParseState.CommandNewState:
                    if (char === ',' || /\s/.test(char))
                        throw 'Whitespace characters and comma are not allowed in new state names';
                    else
                        new_state += char;
                    break;
            }
        }
        var condition = new Transition_3.TuringCondition(cond_state, cond_value);
        var command = new Transition_3.TuringCommand(input || cond_value, stringToMoveDirection(move || "N"), new_state || cond_state);
        return new Transition_3.TuringTransition(condition, command);
    }
    function parseTransitions(text) {
        let transitions = [];
        for (let [lineIndex, line] of text.replace(/\r/g, '').split('\n').entries()) {
            if (line === '')
                continue;
            let error;
            try {
                let transition = parseTransition(line);
                transitions.push(new TuringTransitionParseInfo(transition, { raw: line, line: lineIndex + 1, error }));
            }
            catch (err) {
                error = err;
            }
        }
        return transitions;
    }
    exports_7("parseTransitions", parseTransitions);
    var TuringMachine_3, Transition_3, TuringTransitionErrorType, TuringTransitionError, TuringTransitionParseInfo, ParseState;
    return {
        setters: [
            function (TuringMachine_3_1) {
                TuringMachine_3 = TuringMachine_3_1;
            },
            function (Transition_3_1) {
                Transition_3 = Transition_3_1;
            }
        ],
        execute: function () {
            (function (TuringTransitionErrorType) {
                TuringTransitionErrorType["Error"] = "error";
                TuringTransitionErrorType["Warning"] = "warning";
                TuringTransitionErrorType["Information"] = "information";
            })(TuringTransitionErrorType || (TuringTransitionErrorType = {}));
            exports_7("TuringTransitionErrorType", TuringTransitionErrorType);
            TuringTransitionError = class TuringTransitionError {
                constructor(text, options = {}) {
                    this.text = text;
                    this.type = options.type || TuringTransitionErrorType.Error;
                    this.line = options.line;
                    this.raw = options.raw;
                }
            };
            exports_7("TuringTransitionError", TuringTransitionError);
            TuringTransitionParseInfo = class TuringTransitionParseInfo {
                constructor(transition, { raw, line, error }) {
                    this.transition = transition;
                    this.raw = raw;
                    this.line = line;
                    this.error = error;
                }
            };
            exports_7("TuringTransitionParseInfo", TuringTransitionParseInfo);
            ;
            (function (ParseState) {
                ParseState[ParseState["ConditionState"] = 0] = "ConditionState";
                ParseState[ParseState["ConditionValue"] = 1] = "ConditionValue";
                ParseState[ParseState["CommandNewValue"] = 2] = "CommandNewValue";
                ParseState[ParseState["CommandMove"] = 3] = "CommandMove";
                ParseState[ParseState["CommandNewState"] = 4] = "CommandNewState";
                ParseState[ParseState["Arrow"] = 5] = "Arrow";
            })(ParseState || (ParseState = {}));
            ;
        }
    };
});
System.register("main", ["jquery", "rxjs", "TuringMachine", "TuringMachineCanvas", "tasks", "parsing", "VisStateGraph", "TransitionsTable"], function (exports_8, context_8) {
    var __moduleName = context_8 && context_8.id;
    function init() {
        editor.setShowInvisibles(true);
        editor.$blockScrolling = Infinity;
        rxjs_1.fromEvent(editor, 'input')
            .subscribe(() => {
            let programText = editor.getValue();
            let transitionParseList = parsing_1.parseTransitions(programText);
            let errors = parsing_1.getErrors(transitionParseList);
            jquery_2.default(set_btn).prop('disabled', errors.filter(x => x.type === parsing_1.TuringTransitionErrorType.Error).length !== 0);
            updateErrorsView(errors);
            let transitions = transitionParseList
                .filter(x => !x.error)
                .map(x => x.transition);
            previewTransitionsTable.update(transitions);
            previewGraph.update(transitions);
            constructorTable.update(transitions);
        });
        let turingMachineCanvasEl = document.getElementById('canvas');
        function initMachineCanvas() {
            machineCanvas = new TuringMachineCanvas_1.TuringMachineCanvas(turingMachineCanvasEl);
            machineCanvas.draw();
        }
        onResize(turingMachineCanvasEl, initMachineCanvas);
        initMachineCanvas();
        // table
        jquery_2.default('#add-row').on('click', userAddRow);
        jquery_2.default('#add-col').on('click', userAddCol);
        jquery_2.default('#rem-row').on('click', userRemRow);
        jquery_2.default('#rem-col').on('click', userRemCol);
        jquery_2.default(set_btn).on('click', setupMachine);
        jquery_2.default(step_btn).on('click', stepMachine);
        jquery_2.default(run_btn).on('click', runMachine);
        jquery_2.default(reset_btn).on('click', resetMachine);
        jquery_2.default(rerun_btn).on('click', () => {
            resetMachine();
            runMachine();
        });
        // tasks
        initTasks();
        setTask('replace1');
        jquery_2.default('#loading').hide();
        jquery_2.default('#app').show();
    }
    function initTasks() {
        for (let [task_id, task] of Object.entries(tasks_1.tasks)) {
            var item = document.createElement('li');
            var link = document.createElement('a');
            link.setAttribute('task_id', task_id);
            link.setAttribute('href', '#');
            link.innerHTML = `${task_id} - ${task.memo}`;
            link.addEventListener('click', onTaskLinkClick);
            item.appendChild(link);
            tasks_el.appendChild(item);
        }
    }
    function setTask(task_id) {
        var task = tasks_1.tasks[task_id];
        let algo_text = task.program;
        jquery_2.default(input_el).val(task.input);
        editor.setValue(algo_text, 1);
    }
    function onTaskLinkClick(e) {
        let task_id = e.target.getAttribute('task_id');
        setTask(task_id);
        jquery_2.default(set_btn).click();
    }
    // machine
    function setupMachine() {
        setRuntimeError();
        let algo_text = editor.getValue();
        let inputWord = jquery_2.default(input_el).val().toString();
        let parseInfoList = parsing_1.parseTransitions(algo_text);
        let errors = parsing_1.getErrors(parseInfoList);
        if (errors.filter(x => x.type === "error").length === 0) {
            let transitions = parseInfoList.map(x => x.transition);
            let stateNames = uniq(transitions.map(x => x.condition.state)).sort();
            machine = new TuringMachine_4.TuringMachine(stateNames, stateNames[0], transitions);
            machine.setInput(inputWord);
            machineCanvas.setMachine(machine);
            runtimeTransitionsTable.update(transitions);
            runtimeGraph.update(transitions);
            updateMachineViews();
            for (let btn of [step_btn, run_btn, reset_btn, rerun_btn]) {
                jquery_2.default(btn).prop('disabled', false);
            }
        }
    }
    function resetMachine() {
        if (machine) {
            setRuntimeError();
            machine.reset();
            updateMachineViews();
        }
    }
    function stepMachine() {
        if (machine) {
            setRuntimeError();
            if (!machine.isStopped()) {
                try {
                    machine.step();
                }
                catch (runTimeError) {
                    setRuntimeError(runTimeError);
                }
            }
            updateMachineViews();
        }
    }
    function runMachine() {
        if (machine) {
            setRuntimeError();
            while (!machine.isStopped()) {
                try {
                    machine.step();
                }
                catch (runTimeError) {
                    setRuntimeError(runTimeError);
                    break;
                }
            }
            updateMachineViews();
        }
    }
    function updateMachineViews() {
        if (!machineCanvas || !machine) {
            return;
        }
        machineCanvas.draw();
        runtimeGraph.setActiveState(machine.getCurrentState());
        runtimeTransitionsTable.setNextTransition(machine.getNextTransitionIndex());
        jquery_2.default(step_btn).prop('disabled', machine.isStopped());
        jquery_2.default(run_btn).prop('disabled', machine.isStopped());
    }
    // errors
    function setRuntimeError(errorMessage = '') {
        jquery_2.default('#run-error').html(errorMessage);
    }
    function updateErrorsView(errors) {
        let errorsEl = jquery_2.default('#trans-errors');
        errorsEl.empty();
        for (let error of errors) {
            let lbl = error.type.toString();
            if (lbl === 'error')
                lbl = 'danger';
            errorsEl.append(`<tr><td>. <span class='label label-${lbl}'>${error.type}</span></td><td>${error.line || ''}</td><td>${error.text}</td></tr>`);
        }
        let errorsCount = errors.filter(x => x.type === parsing_1.TuringTransitionErrorType.Error).length;
        const counterEl = jquery_2.default(error_counter);
        counterEl.text(errorsCount);
        if (errorsCount > 0) {
            counterEl.show();
        }
        else {
            counterEl.hide();
        }
        let warnCount = errors.filter(x => x.type === parsing_1.TuringTransitionErrorType.Warning).length;
        const warnCounterEl = jquery_2.default(warn_counter);
        warnCounterEl.text(warnCount);
        if (warnCount > 0) {
            warnCounterEl.show();
        }
        else {
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
    function tableToAlgo() {
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
    function uniq(a) {
        var seen = {};
        return a.filter(function (item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }
    function onResize(element, callback) {
        var elementHeight = element.height, elementWidth = element.width;
        setInterval(function () {
            if (element.height !== elementHeight || element.width !== elementWidth) {
                elementHeight = element.height;
                elementWidth = element.width;
                callback();
            }
        }, 300);
    }
    var jquery_2, rxjs_1, TuringMachine_4, TuringMachineCanvas_1, tasks_1, parsing_1, VisStateGraph_1, TransitionsTable_1, set_btn, reset_btn, rerun_btn, step_btn, run_btn, input_el, tasks_el, error_counter, warn_counter, editor, machine, machineCanvas, previewTransitionsTable, runtimeTransitionsTable, constructorTable, previewGraph, runtimeGraph;
    return {
        setters: [
            function (jquery_2_1) {
                jquery_2 = jquery_2_1;
            },
            function (rxjs_1_1) {
                rxjs_1 = rxjs_1_1;
            },
            function (TuringMachine_4_1) {
                TuringMachine_4 = TuringMachine_4_1;
            },
            function (TuringMachineCanvas_1_1) {
                TuringMachineCanvas_1 = TuringMachineCanvas_1_1;
            },
            function (tasks_1_1) {
                tasks_1 = tasks_1_1;
            },
            function (parsing_1_1) {
                parsing_1 = parsing_1_1;
            },
            function (VisStateGraph_1_1) {
                VisStateGraph_1 = VisStateGraph_1_1;
            },
            function (TransitionsTable_1_1) {
                TransitionsTable_1 = TransitionsTable_1_1;
            }
        ],
        execute: function () {
            set_btn = document.getElementById('set_btn');
            reset_btn = document.getElementById('reset_btn');
            rerun_btn = document.getElementById('reset_and_run_btn');
            step_btn = document.getElementById('step_btn');
            run_btn = document.getElementById('run_btn');
            input_el = document.getElementById('input');
            tasks_el = document.getElementById('tasks-list');
            error_counter = document.getElementById('error-counter');
            warn_counter = document.getElementById('warn-counter');
            //---------------------------------------
            editor = ace.edit("algo");
            machine = null;
            machineCanvas = null;
            previewTransitionsTable = new TransitionsTable_1.TransitionsTable(document.getElementById('commands'));
            runtimeTransitionsTable = new TransitionsTable_1.TransitionsTable(document.getElementById('commands-run'));
            constructorTable = new TransitionsTable_1.TransitionsConstructorTable(document.getElementById('table-constructor'), tableToAlgo);
            previewGraph = new VisStateGraph_1.VisStateGraph(document.getElementById('preview-graph'));
            runtimeGraph = new VisStateGraph_1.VisStateGraph(document.getElementById('runtime-graph'), { interactive: false });
            init();
        }
    };
});
//# sourceMappingURL=app.js.map