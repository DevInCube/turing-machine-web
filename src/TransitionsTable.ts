import { MoveDirection, TuringTransition } from './Transition'
import $ from 'jquery';

export class TransitionsConstructorTable {
    constructor(readonly table: HTMLTableElement, readonly inputHandler: () => void) {
        $(table)
            .append($('<tr>')
                .append($('<td>'))
                .append($('<td>').append($('<input>').addClass('init-cell').attr('type', 'text'))))
            .append($('<tr>')
                .append($('<td>').append($('<input>').addClass('init-cell').attr('type', 'text')))
                .append($('<td>').append($('<input>').addClass('init-cell').attr('type', 'text'))));
        for (let cell of $('.init-cell')) {
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

    getProgramFromTable(): string {
        var re = /_/g;
        var programText = '';
        var colsLen = this.table.rows[0].cells.length;
        for (var i = 1; i < this.table.rows.length; i++) {
            var state = (<HTMLInputElement>this.table.rows[i].cells[0].children[0]).value;
            for (var j = 1; j < colsLen; j++) {
                var inputSym = (<HTMLInputElement>this.table.rows[0].cells[j].children[0]).value;
                var value = (<HTMLInputElement>this.table.rows[i].cells[j].children[0]).value;
                if (value) {
                    programText += `${state},${inputSym}->${value.trim()}`.replace(re, ' ') + "\n";
                }
            }
        }
        return programText;
    }

    private createTable(width: number, height: number) {
        while (this.table.rows.length > 2) { this.removeLastRow(); }
        while (this.table.rows[0].cells.length > 2) { this.removeLastColumn(); }
        this.setTableCellValue(0, 1, '');
        this.setTableCellValue(1, 0, '');
        this.setTableCellValue(1, 1, '');
        while (this.table.rows.length < height + 1) this.appendRow();
        while (this.table.rows[0].cells.length < width + 1) this.appendColumn();
    }

    private setTableCellValue(i: number, j: number, value: string) {
        (<HTMLInputElement>this.table.rows[i].cells[j].children[0]).value = value;
    }

    update(transitions: TuringTransition[]) {
        let symbols = uniq(transitions.map(x => x.condition.value)).sort();
        let states = uniq(transitions.map(x => x.condition.state)).sort();

        this.createTable(symbols.length, states.length);
        for (let i = 0; i < states.length + 1; i++) {
            for (let j = 0; j < symbols.length + 1; j++) {
                if (i === 0 && j === 0) continue;
                let state = '';
                let value = '';
                if (i > 0) state = states[i - 1];
                if (j > 0) value = symbols[j - 1];
                if (i === 0 && j > 0) {
                    if (value === ' ') value = '_';
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

        function getTransition(_state: string, _value: string): TuringTransition | undefined {
            for (let trans of transitions) {
                if (trans.condition.state === _state &&
                    trans.condition.value === _value) {
                    return trans;
                }
            }
            return undefined;
        }
    }
}


export class TransitionsTable {
    constructor(readonly table: HTMLTableElement) {
    }

    update(transitions: TuringTransition[]): void {
        let transitions_table_id = this.table.getAttribute('id');
        $(this.table).empty();
        for (let [i, t] of transitions.entries()) {
            let row = $('<tr>').attr('id', transitions_table_id + '_' + i)
                .append($('<td>').append(i.toString()))
                .append($('<td>').html(`(${t.condition.state})`))
                .append($('<td>').html(`'${t.condition.value}'`))
                .append($('<td>').html('—>'))
                .append($('<td>').html(`'${t.command.input}'`))
                .append($('<td>').html(this.moveDirectionToString(t.command.move_dir)))
                .append($('<td>').html(`(${t.command.new_state})`));
            $(this.table).append($(row));
        }
    }

    private moveDirectionToString(move_dir: MoveDirection): string {
        switch (move_dir) {
            case MoveDirection.Left: return '<- L';
            case MoveDirection.Right: return 'R ->';
            default: return 'N';
        }
    }

    setNextTransition(index: number): void {
        for (let row of [].slice.call(this.table.rows)) {
            $(row).removeClass('active');
        }
        if (index >= 0) {
            $(this.table.rows[index]).addClass('active');
            $(this.table).removeClass('commands-error');
        } else {
            $(this.table).addClass('commands-error');
        }
    }
}

// utils

function uniq(a: string[]) {
    var seen: { [id: string]: boolean } = {};
    return a.filter(function (item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

