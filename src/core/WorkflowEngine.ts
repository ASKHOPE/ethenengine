// Core Platform: Workflow Automation Engine (Supporting Engine)

import { EventBus, PlatformEvent } from '../foundation/EventBus.js';
import { Logger } from '../foundation/Logger.js';

export interface WorkflowAction {
  type: 'publish_event' | 'log_audit' | 'custom_function';
  payload: Record<string, any>;
}

export interface WorkflowRule {
  id: string;
  tenantId: string;
  name: string;
  triggerEvent: string;
  actions: WorkflowAction[];
  enabled: boolean;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private workflows: Map<string, WorkflowRule> = new Map();
  private eventBus = EventBus.getInstance();
  private logger = Logger.getInstance();

  private constructor() {
    this.listenToEvents();
    this.seedDefaultWorkflows();
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  private seedDefaultWorkflows() {
    const defaultWorkflow: WorkflowRule = {
      id: 'wf_order_fulfillment',
      tenantId: 'tenant_default',
      name: 'Auto Fulfillment Trigger',
      triggerEvent: 'order.created',
      enabled: true,
      actions: [
        {
          type: 'publish_event',
          payload: { eventName: 'order.fulfillment.started' },
        },
      ],
    };
    this.workflows.set(defaultWorkflow.id, defaultWorkflow);
  }

  public addWorkflow(rule: WorkflowRule) {
    this.workflows.set(rule.id, rule);
  }

  private listenToEvents() {
    this.eventBus.subscribe('*', async (event: PlatformEvent) => {
      for (const workflow of this.workflows.values()) {
        if (workflow.enabled && workflow.triggerEvent === event.eventName && workflow.tenantId === event.tenantId) {
          await this.executeWorkflow(workflow, event);
        }
      }
    });
  }

  private async executeWorkflow(workflow: WorkflowRule, event: PlatformEvent) {
    this.logger.info(`[WorkflowEngine] Executing workflow [${workflow.name}] on event [${event.eventName}]`, {
      tenantId: event.tenantId,
    });

    for (const action of workflow.actions) {
      if (action.type === 'publish_event') {
        await this.eventBus.publish(action.payload.eventName, { triggerId: event.id }, { tenantId: event.tenantId });
      }
    }
  }

  public listWorkflows(tenantId: string): WorkflowRule[] {
    return Array.from(this.workflows.values()).filter((w) => w.tenantId === tenantId);
  }
}
