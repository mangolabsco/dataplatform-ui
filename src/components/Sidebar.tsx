import React from 'react';
import { Database, Globe, FileText, Settings, Filter, BarChart3, Clock, HardDrive } from 'lucide-react';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeCategories = [
    {
      title: 'Sources',
      nodes: [
        { type: 'source', subtype: 'database', label: 'Database', icon: Database, color: 'text-green-600' },
        { type: 'source', subtype: 'api', label: 'API', icon: Globe, color: 'text-green-600' },
        { type: 'source', subtype: 'file', label: 'File', icon: FileText, color: 'text-green-600' },
      ]
    },
    {
      title: 'Transformations',
      nodes: [
        { type: 'transformation', subtype: 'filter', label: 'Filter', icon: Filter, color: 'text-blue-600' },
        { type: 'transformation', subtype: 'map', label: 'Map', icon: Settings, color: 'text-blue-600' },
        { type: 'transformation', subtype: 'aggregate', label: 'Aggregate', icon: BarChart3, color: 'text-blue-600' },
      ]
    },
    {
      title: 'Tables',
      nodes: [
        { type: 'table', subtype: 'temporary', label: 'Temp Table', icon: Clock, color: 'text-purple-600' },
        { type: 'table', subtype: 'persistent', label: 'Persistent Table', icon: HardDrive, color: 'text-purple-600' },
        { type: 'table', subtype: 'versioned', label: 'Versioned Table', icon: Database, color: 'text-purple-600' },
      ]
    },
    {
      title: 'Sinks',
      nodes: [
        { type: 'sink', subtype: 'database', label: 'Database', icon: Database, color: 'text-red-600' },
        { type: 'sink', subtype: 'api', label: 'API', icon: Globe, color: 'text-red-600' },
        { type: 'sink', subtype: 'file', label: 'File', icon: FileText, color: 'text-red-600' },
      ]
    }
  ];

  return (
    <div className="w-64 bg-muted border-r border-border p-6 h-full overflow-y-auto">
      <h3 className="text-lg font-semibold text-foreground mb-6">Components</h3>
      
      {nodeCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-8">
          <h4 className="text-sm font-medium text-muted-foreground mb-4">{category.title}</h4>
          <div className="space-y-3">
            {category.nodes.map((node, nodeIndex) => {
              const IconComponent = node.icon;
              return (
                <div
                  key={nodeIndex}
                  className="flex items-center p-4 bg-card rounded-lg shadow-sm cursor-grab hover:shadow-md transition-shadow border border-border"
                  draggable
                  onDragStart={(event) => onDragStart(event, `${node.type}-${node.subtype}`)}
                >
                  <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-4 ${
                    node.type === 'source' ? 'bg-green-100' :
                    node.type === 'transformation' ? 'bg-blue-100' :
                    node.type === 'table' ? 'bg-purple-100' : 'bg-red-100'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${node.color}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{node.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
