import vis from 'vis';

import { TuringTransition } from './Transition';
import { TuringMachine } from './TuringMachine';

interface StateGraph {
    [id: string]: TuringTransition[]
}

interface VisNetNode {
    id: string,
    label: string,
    fixed?: boolean,
    font: { size: number },
    color: {
        highlight: { background: string },
        background?: string
    }
};

interface VisNetEdge {
    id: string,
    from: string,
    to: string,
    label: string,
    title: string,
    arrows: string,
    selfReferenceSize: number
}

export class VisStateGraph {
    private network: vis.Network;

    constructor(readonly container: HTMLElement, readonly options: { interactive: boolean } = { interactive: true }) {
    }

    update(transitions: TuringTransition[]): void {
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
        this.network = new vis.Network(this.container, data, options);
    }

    setActiveState(state: string): void {
        this.network.selectNodes([state], false);
    }
}

function transitionsToStateGraph(transitions: TuringTransition[]): StateGraph {
    var stateGraph: StateGraph = {
        [TuringMachine.stop_state]: []
    };
    for (let transition of transitions) {
        var state = transition.condition.state;
        if (!stateGraph.hasOwnProperty(state))
            stateGraph[state] = [];
        stateGraph[state].push(transition);
    }
    return stateGraph;
}

function stateGraphToVisNetworkData(stateGraph: StateGraph): { nodes: vis.DataSet<VisNetNode>, edges: vis.DataSet<VisNetEdge> } {
    var nodes: VisNetNode[] = [];
    var edges: VisNetEdge[] = [];
    for (let stateId in stateGraph) {
        let netNode: VisNetNode = {
            id: stateId,
            label: stateId,
            font: {
                size: 18,
            },
            color: {
                highlight: { background: 'yellow' },
                background: stateId == TuringMachine.stop_state ? '#faa' : 'lightsteelblue'
            },
            fixed: stateId == TuringMachine.stop_state
        };
        nodes.push(netNode);
        let self_count = 10;
        for (let edge of stateGraph[stateId]) {
            if (edge.command.new_state == stateId)
                self_count += 10;
            let text = `'${edge.condition.value}'/'${edge.command.input}',${edge.command.move_dir}`;
            let netEdge: VisNetEdge = {
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
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };
}

function getVisNetworkOptions(): vis.Options {
    var options: vis.Options = <vis.Options>{
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
