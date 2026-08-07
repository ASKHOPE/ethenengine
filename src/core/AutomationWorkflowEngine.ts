// Core Platform: n8n-Style Node-Based Automation Workflow Engine

import { EventBus, PlatformEvent } from '../foundation/EventBus.js';
import { Logger } from '../foundation/Logger.js';

export type NodeType = 'trigger' | 'condition' | 'action';

export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  handler: 'event_trigger' | 'if_else' | 'send_email' | 'http_request' | 'update_cms';
  config: Record<string, any>;
  nextNodes: string[]; // Connected Node IDs
}

export interface NodeWorkflowGraph {
  id: string;
  tenantId: string;
  name: string;
  enabled: boolean;
  startNodeId: string;
  nodes: Record<string, WorkflowNode>;
}

export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'failed' | 'skipped';
  output: Record<string, any>;
}

export class AutomationWorkflowEngine {
  private static instance: AutomationWorkflowEngine;
  private workflows: Map<string, NodeWorkflowGraph> = new Map();
  private eventBus = EventBus.getInstance();
  private logger = Logger.getInstance();

  private constructor() {
    this.listenToEvents();
    this.seedDefaultGraph();
  }

  public static getInstance(): AutomationWorkflowEngine {
    if (!AutomationWorkflowEngine.instance) {
      AutomationWorkflowEngine.instance = new AutomationWorkflowEngine();
    }
    return AutomationWorkflowEngine.instance;
  }

  private seedDefaultGraph() {
    const graph: NodeWorkflowGraph = {
      id: 'flow_n8n_order_automation',
      tenantId: 'tenant_default',
      name: 'High Value Order Notification Workflow',
      enabled: true,
      startNodeId: 'node_trigger',
      nodes: {
        node_trigger: {
          id: 'node_trigger',
          name: 'On Order Created Event',
          type: 'trigger',
          handler: 'event_trigger',
          config: { eventName: 'order.created' },
          nextNodes: ['node_condition'],
        },
        node_condition: {
          id: 'node_condition',
          name: 'Check If Total Amount > $100',
          type: 'condition',
          handler: 'if_else',
          config: { field: 'totalAmount', operator: 'gt', value: 100 },
          nextNodes: ['node_action_email'],
        },
        node_action_email: {
          id: 'node_action_email',
          name: 'Send High Value Alert Email',
          type: 'action',
          handler: 'send_email',
          config: { recipient: 'sales@acme.com', template: 'High Value Order Alert' },
          nextNodes: [],
        },
      },
    };

    this.workflows.set(graph.id, graph);
  }

  public createWorkflow(graph: Omit<NodeWorkflowGraph, 'id'>): NodeWorkflowGraph {
    const newGraph: NodeWorkflowGraph = {
      ...graph,
      id: `flow_${Date.now()}`,
    };
    this.workflows.set(newGraph.id, newGraph);
    return newGraph;
  }

  public listWorkflows(tenantId: string): NodeWorkflowGraph[] {
    return Array.from(this.workflows.values()).filter((w) => w.tenantId === tenantId);
  }

  private listenToEvents() {
    this.eventBus.subscribe('*', async (event: PlatformEvent) => {
      for (const graph of this.workflows.values()) {
        if (graph.enabled && (!event.tenantId || graph.tenantId === event.tenantId)) {
          const startNode = graph.nodes[graph.startNodeId];
          if (startNode && startNode.config.eventName === event.eventName) {
            await this.executeGraph(graph, event.payload);
          }
        }
      }
    });
  }

  public async executeGraph(graph: NodeWorkflowGraph, initialPayload: Record<string, any>): Promise<NodeExecutionResult[]> {
    this.logger.info(`[AutomationEngine] Starting execution graph [${graph.name}]`, { tenantId: graph.tenantId });

    const results: NodeExecutionResult[] = [];
    let currentNodeId: string | undefined = graph.startNodeId;
    let currentPayload = { ...initialPayload };

    while (currentNodeId) {
      const node: WorkflowNode = graph.nodes[currentNodeId];
      if (!node) break;

      const result = await this.executeNode(node, currentPayload);
      results.push(result);

      if (result.status === 'failed' || result.status === 'skipped') {
        break;
      }

      currentPayload = { ...currentPayload, ...result.output };
      currentNodeId = node.nextNodes[0]; // Proceed to next connected node in graph
    }

    return results;
  }

  private async executeNode(node: WorkflowNode, payload: Record<string, any>): Promise<NodeExecutionResult> {
    this.logger.info(`[AutomationEngine] Executing Node [${node.name}] (${node.handler})`);

    if (node.handler === 'event_trigger') {
      return { nodeId: node.id, status: 'success', output: payload };
    }

    if (node.handler === 'if_else') {
      const { field, operator, value } = node.config;
      const actualVal = payload[field];

      let pass = false;
      if (operator === 'gt') pass = Number(actualVal) > Number(value);
      if (operator === 'eq') pass = actualVal === value;

      return {
        nodeId: node.id,
        status: pass ? 'success' : 'skipped',
        output: { conditionPassed: pass },
      };
    }

    if (node.handler === 'send_email') {
      this.logger.info(`[Action Node: Email] Sent email to ${node.config.recipient}`);
      return { nodeId: node.id, status: 'success', output: { emailSent: true } };
    }

    if (node.handler === 'http_request') {
      this.logger.info(`[Action Node: HTTP] Called external API endpoint ${node.config.url}`);
      return { nodeId: node.id, status: 'success', output: { httpStatus: 200 } };
    }

    return { nodeId: node.id, status: 'success', output: {} };
  }
}
