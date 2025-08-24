import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import SourceNode from './nodes/SourceNode';
import TransformationNode from './nodes/TransformationNode';
import SinkNode from './nodes/SinkNode';
import TableNode from './nodes/TableNode';
import Sidebar from './Sidebar';
import ModuleSelectionModal from './ModuleSelectionModal';
import QuickTableCreationModal from './QuickTableCreationModal';
import { NodeData } from '../types/nodes';
import { ModuleDefinition, ModuleInstance } from '../types/modules';
import { mockApi } from '../services/mockApi';
import { ArrowLeft } from 'lucide-react';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let id = 0;
const getId = () => `dndnode_${id++}`;

interface WorkflowEditorProps {
  workflowId?: string | null;
  onBack?: () => void;
}

const WorkflowEditor: React.FC<WorkflowEditorProps> = ({ workflowId, onBack }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Workflow name state and name prompt modal
  const [workflowName, setWorkflowName] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState<string>('');
  
  // Module selection modal state
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [pendingNodeType, setPendingNodeType] = useState<'source' | 'transformation' | 'sink' | 'table'>('source');
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Table creation modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [pendingTableType, setPendingTableType] = useState<'temporary' | 'persistent' | 'versioned'>('temporary');

  const nodeTypes: NodeTypes = useMemo(() => ({
    source: SourceNode,
    transformation: TransformationNode,
    sink: SinkNode,
    table: TableNode,
  }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Load existing workflow when workflowId is provided
  useEffect(() => {
    const loadWorkflow = async () => {
      if (workflowId) {
        try {
          const workflow = await mockApi.getWorkflowById(workflowId);
          if (workflow) {
            const { x = 0, y = 0, zoom = 1 } = workflow.viewport || {};
            setWorkflowName(workflow.name || '');
            setNodes(workflow.nodes || []);
            setEdges(workflow.edges || []);
            
            // Set viewport after a short delay to ensure ReactFlow is initialized
            setTimeout(() => {
              if (reactFlowInstance) {
                reactFlowInstance.setViewport({ x, y, zoom });
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error loading workflow:', error);
          alert('Failed to load workflow.');
        }
      }
    };

    loadWorkflow();
  }, [workflowId, reactFlowInstance, setNodes, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const [nodeType, subtype] = type.split('-');
      
      // Handle table nodes differently - show quick table creation modal
      if (nodeType === 'table') {
        setPendingTableType(subtype as 'temporary' | 'persistent' | 'versioned');
        setPendingPosition(position);
        setShowTableModal(true);
      } else {
        // Store the pending node details and show module selection modal
        setPendingNodeType(nodeType as 'source' | 'transformation' | 'sink');
        setPendingPosition(position);
        setShowModuleModal(true);
      }
    },
    [reactFlowInstance],
  );

  const saveWithName = useCallback(async (finalName: string) => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    try {
      const workflowData = {
        name: finalName,
        description: 'Saved from workflow editor',
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport
      };

      if (workflowId) {
        await mockApi.updateWorkflow(workflowId, workflowData);
      } else {
        await mockApi.saveWorkflow(workflowData);
      }
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow.');
    }
  }, [reactFlowInstance, workflowId]);

  const onSave = useCallback(async () => {
    if (!reactFlowInstance) return;
    const nameToUse = (workflowName || '').trim();
    if (nameToUse) {
      await saveWithName(nameToUse);
    } else {
      setTempName(`Workflow ${new Date().toLocaleDateString()}`);
      setShowNameModal(true);
    }
  }, [reactFlowInstance, workflowName, saveWithName]);

  const onRestore = useCallback(async () => {
    try {
      const workflows = await mockApi.getWorkflows();
      if (workflows.length > 0) {
        // Load the first workflow as an example
        const workflow = workflows[0];
        const { x = 0, y = 0, zoom = 1 } = workflow.viewport || {};
        setWorkflowName(workflow.name || '');
        setNodes(workflow.nodes || []);
        setEdges(workflow.edges || []);
        if (reactFlowInstance) {
          reactFlowInstance.setViewport({ x, y, zoom });
        }
        alert(`Loaded workflow: ${workflow.name}`);
      } else {
        alert('No workflows found.');
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      alert('Failed to load workflow.');
    }
  }, [setNodes, setEdges, reactFlowInstance]);

  const onExecute = useCallback(async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      
      // Validate workflow has nodes connected properly
      if (!flow.nodes || flow.nodes.length === 0) {
        alert('Cannot execute empty workflow. Add some nodes first!');
        return;
      }
      
      // Check for table nodes to demonstrate staged execution
      const tableNodes = flow.nodes.filter((node: any) => node.type === 'table');
      if (tableNodes.length > 0) {
        alert(`Executing multi-stage workflow with ${tableNodes.length} intermediate table(s) for data storage...`);
      }
      
      try {
        // Save current workflow first
        const workflowData = {
          name: `Execution ${new Date().toLocaleTimeString()}`,
          description: 'Workflow execution from editor',
          nodes: flow.nodes,
          edges: flow.edges,
          viewport: flow.viewport
        };
        
        const savedWorkflow = await mockApi.saveWorkflow(workflowData);
        const result = await mockApi.executeWorkflow(savedWorkflow.id);
        
        if (result.success) {
          alert(`✅ ${result.message}\nExecution ID: ${result.executionId}`);
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error) {
        console.error('Error executing workflow:', error);
        alert('❌ Workflow execution failed.');
      }
    }
  }, [reactFlowInstance]);

  // Handle module selection from modal
  const handleModuleSelect = useCallback(
    (moduleInstance: ModuleInstance, moduleDefinition: ModuleDefinition) => {
      const nodeData: NodeData = {
        label: moduleInstance.name,
        type: pendingNodeType,
        config: {
          moduleId: moduleDefinition.id,
          instanceId: moduleInstance.id,
          type: moduleDefinition.type,
          configuration: moduleInstance.configuration,
          ...moduleInstance.configuration
        }
      };

      const newNode: Node = {
        id: getId(),
        type: pendingNodeType,
        position: pendingPosition,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
      setShowModuleModal(false);
    },
    [pendingNodeType, pendingPosition, setNodes],
  );

  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    setShowModuleModal(false);
  }, []);

  // Handle table selection from quick table modal
  const handleTableSelect = useCallback(
    (tableInstance: ModuleInstance) => {
      const nodeData: NodeData = {
        label: tableInstance.name,
        type: 'table',
        config: {
          moduleId: tableInstance.module_id,
          instanceId: tableInstance.id,
          type: pendingTableType,
          configuration: tableInstance.configuration,
          tableName: tableInstance.configuration?.table_name || tableInstance.name,
          storageType: pendingTableType,
          ...tableInstance.configuration
        }
      };

      const newNode: Node = {
        id: getId(),
        type: 'table',
        position: pendingPosition,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
      setShowTableModal(false);
    },
    [pendingTableType, pendingPosition, setNodes],
  );

  // Handle table modal cancel
  const handleTableModalCancel = useCallback(() => {
    setShowTableModal(false);
  }, []);

  // Name modal handlers
  const handleNameModalCancel = useCallback(() => {
    setShowNameModal(false);
  }, []);

  const handleNameModalSave = useCallback(async () => {
    const final = (tempName || '').trim();
    if (!final) {
      alert('Please enter a name for the workflow.');
      return;
    }
    await saveWithName(final);
    setWorkflowName(final);
    setShowNameModal(false);
  }, [tempName, saveWithName]);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder={workflowId ? 'Edit workflow name' : 'Untitled Workflow'}
              className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save
            </button>
            <button
              onClick={onRestore}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Load
            </button>
            <button
              onClick={onExecute}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Execute
            </button>
          </div>
        </div>
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
      
      {/* Name Prompt Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save workflow</h3>
            <p className="text-sm text-gray-600 mb-3">Enter a name for this workflow.</p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Untitled Workflow"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleNameModalCancel}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNameModalSave}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module Selection Modal */}
      <ModuleSelectionModal
        isOpen={showModuleModal}
        nodeType={pendingNodeType}
        position={pendingPosition}
        onSelect={handleModuleSelect}
        onCancel={handleModalCancel}
      />
      
      {/* Quick Table Creation Modal */}
      <QuickTableCreationModal
        isOpen={showTableModal}
        tableType={pendingTableType}
        position={pendingPosition}
        onSelect={handleTableSelect}
        onCancel={handleTableModalCancel}
      />
    </div>
  );
};

const WorkflowEditorWithProvider: React.FC<WorkflowEditorProps> = ({ workflowId, onBack }) => (
  <ReactFlowProvider>
    <WorkflowEditor workflowId={workflowId} onBack={onBack} />
  </ReactFlowProvider>
);

export default WorkflowEditorWithProvider;
