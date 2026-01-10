import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useVariableStore, useRelationshipStore, useUIStore } from '../../stores';

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  value: number;
  normalizedValue: number;
  category: string;
  color: string;
  radius: number;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  id: string;
  strength: number;
  type: 'positive' | 'negative' | 'custom';
  delay: number;
}

export function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { variables, updateVariablePosition } = useVariableStore();
  const { relationships } = useRelationshipStore();
  const {
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,
    networkLayout,
    openVariableModal,
    openRelationshipModal,
    startCreatingRelationship,
    isCreatingRelationship,
    relationshipSource,
  } = useUIStore();

  // Transform data for D3
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, NetworkNode>();

    const nodes: NetworkNode[] = variables.map((v) => {
      const range = v.max - v.min;
      const normalizedValue = range > 0 ? (v.currentValue - v.min) / range : 0.5;
      const radius = 20 + normalizedValue * 20;

      const node: NetworkNode = {
        id: v.id,
        name: v.name,
        value: v.currentValue,
        normalizedValue,
        category: v.category,
        color: v.categoryColor,
        radius,
        x: v.position?.x,
        y: v.position?.y,
      };

      nodeMap.set(v.id, node);
      return node;
    });

    const links: NetworkLink[] = relationships
      .filter((r) => nodeMap.has(r.sourceId) && nodeMap.has(r.targetId))
      .map((r) => ({
        id: r.id,
        source: r.sourceId,
        target: r.targetId,
        strength: Math.abs(r.influenceStrength),
        type: r.relationshipType,
        delay: r.delay,
      }));

    return { nodes, links };
  }, [variables, relationships]);

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g').attr('class', 'main-group');

    // Define arrow markers
    const defs = svg.append('defs');

    ['positive', 'negative', 'custom'].forEach((type) => {
      const color = type === 'positive' ? '#22c55e' : type === 'negative' ? '#ef4444' : '#8b5cf6';

      defs
        .append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', color);
    });

    // Create simulation
    const simulation = d3
      .forceSimulation<NetworkNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<NetworkNode, NetworkLink>(links)
          .id((d) => d.id)
          .distance(150)
          .strength((d) => d.strength * 0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<NetworkNode>().radius((d) => d.radius + 10));

    // Draw links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', (d) => `network-link ${d.type}`)
      .attr('stroke', (d) =>
        d.type === 'positive' ? '#22c55e' : d.type === 'negative' ? '#ef4444' : '#8b5cf6'
      )
      .attr('stroke-width', (d) => 1 + d.strength * 3)
      .attr('stroke-opacity', 0.6)
      .attr('fill', 'none')
      .attr('marker-end', (d) => `url(#arrow-${d.type})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        openRelationshipModal(d.id);
      });

    // Add link labels for delay
    const linkLabels = g
      .append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links.filter((l) => l.delay > 0))
      .join('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('font-size', 10)
      .attr('fill', '#6b7280')
      .text((d) => `⏱${d.delay}`);

    // Create drag behavior
    const dragBehavior = d3
      .drag<SVGGElement, NetworkNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        // Save position
        if (d.x !== undefined && d.y !== undefined) {
          updateVariablePosition(d.id, { x: d.x, y: d.y });
        }
        d.fx = null;
        d.fy = null;
      });

    // Draw nodes
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, NetworkNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'network-node')
      .style('cursor', 'pointer')
      .call(dragBehavior)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (isCreatingRelationship && relationshipSource && relationshipSource !== d.id) {
          // Handle relationship creation
          openRelationshipModal();
        } else {
          openVariableModal(d.id);
        }
      })
      .on('contextmenu', (event, d) => {
        event.preventDefault();
        startCreatingRelationship(d.id);
      });

    // Node circles
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.9);

    // Value indicator ring
    node
      .append('circle')
      .attr('r', (d) => d.radius + 4)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => {
        const circumference = 2 * Math.PI * (d.radius + 4);
        const dashLength = circumference * d.normalizedValue;
        return `${dashLength} ${circumference}`;
      })
      .attr('stroke-dashoffset', (d) => {
        const circumference = 2 * Math.PI * (d.radius + 4);
        return circumference * 0.25; // Start from top
      })
      .attr('opacity', 0.5);

    // Node labels
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 16)
      .attr('font-size', 12)
      .attr('font-weight', 500)
      .attr('fill', '#374151')
      .text((d) => d.name)
      .each(function () {
        // Truncate long names
        const text = d3.select(this);
        const name = text.text();
        if (name.length > 15) {
          text.text(name.substring(0, 12) + '...');
        }
      });

    // Node value labels
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', 11)
      .attr('font-weight', 600)
      .attr('fill', '#fff')
      .text((d) => d.value.toFixed(1));

    // Link path generator
    function linkArc(d: NetworkLink) {
      const source = d.source as NetworkNode;
      const target = d.target as NetworkNode;

      if (!source.x || !source.y || !target.x || !target.y) return '';

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;

      // Offset for source/target radius
      const angle = Math.atan2(dy, dx);
      const sourceX = source.x + Math.cos(angle) * source.radius;
      const sourceY = source.y + Math.sin(angle) * source.radius;
      const targetX = target.x - Math.cos(angle) * (target.radius + 10);
      const targetY = target.y - Math.sin(angle) * (target.radius + 10);

      return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
    }

    // Update positions on tick
    simulation.on('tick', () => {
      link.attr('d', linkArc);

      linkLabels.attr('transform', (d) => {
        const source = d.source as NetworkNode;
        const target = d.target as NetworkNode;
        if (!source.x || !source.y || !target.x || !target.y) return '';
        const x = (source.x + target.x) / 2;
        const y = (source.y + target.y) / 2;
        return `translate(${x},${y})`;
      });

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
        setPanOffset({ x: event.transform.x, y: event.transform.y });
      });

    svg.call(zoom);

    // Apply initial zoom
    svg.call(zoom.transform, d3.zoomIdentity.translate(panOffset.x, panOffset.y).scale(zoomLevel));

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, networkLayout]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Instructions overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-lg font-medium mb-2">No variables to visualize</p>
            <p className="text-sm">Add variables to see the network graph</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg">
          <div className="font-medium mb-2 text-gray-700">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-green-500" />
              <span className="text-gray-600">Positive influence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-red-500" />
              <span className="text-gray-600">Negative influence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-purple-500" />
              <span className="text-gray-600">Custom influence</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-gray-500">
            <p>Click node: Edit variable</p>
            <p>Right-click: Create relationship</p>
            <p>Drag: Reposition</p>
          </div>
        </div>
      )}

      {/* Creating relationship indicator */}
      {isCreatingRelationship && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          Click on target node to create relationship
        </div>
      )}
    </div>
  );
}
