import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const CollapsibleTreeTab = ({ linkedInPulseTopicsData }) => {
  const svgRef = useRef(null);
  const rootRef = useRef(null);
  const updateRef = useRef(null);
  const zoomRef = useRef(null);
  const initialTransformRef = useRef(null);
  const svgInstanceRef = useRef(null);

  const expandToLevel = (root, level) => {
    if (!root) return;
    
    if (level > 0) {
      if (root._children) {
        root.children = root._children;
        root._children = null;
      }
      if (root.children) {
        root.children.forEach(child => expandToLevel(child, level - 1));
      }
    } else {
      if (root.children) {
        root._children = root.children;
        root.children = null;
      }
    }
  };

  const handleExpandLevel = (level) => {
    if (rootRef.current && updateRef.current) {
      expandToLevel(rootRef.current, level);
      updateRef.current(rootRef.current);
    }
  };

  useEffect(() => {
    if (!linkedInPulseTopicsData) return;
    d3.select(svgRef.current).selectAll('*').remove();

    const data = linkedInPulseTopicsData;
    const width = 1200;
    const height = 1200;
    const dx = 45;
    const dy = width / 4;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [-dy / 2, -height/2, width, height])
      .style('font', '12px Inter, sans-serif')
      .style('user-select', 'none')
      .attr('class', 'bg-gray-50 rounded-lg shadow-inner');
    
    svgInstanceRef.current = svg;

    const gZoom = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.05, 8])
      .on('zoom', (event) => {
        gZoom.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);
    
    const initialTransform = d3.zoomIdentity
      .translate(width / 4, 2)
      .scale(0.8);

    initialTransformRef.current = initialTransform;
    svg.call(zoom.transform, initialTransform);

    let gLink = gZoom
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    let gNode = gZoom
      .append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all');

    const tree = d3.tree()
      .nodeSize([dx, dy]);

    const diagonal = d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);

    let root = d3.hierarchy(data);
    root.x0 = dy / 2;
    root.y0 = 0;
    
    rootRef.current = root;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    root.children && root.children.forEach(collapse);

    function update(source) {
      let nodes = root.descendants().reverse();
      let links = root.links();

      tree(root);

      let left = root;
      let right = root;
      root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      let height = right.x - left.x + dx * 2;

      let transition = svg
        .transition()
        .duration(400)
        .attr('viewBox', [-dy / 2, left.x - dx, width, height])
        .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch('toggle'));

      const node = gNode.selectAll('g').data(nodes, (d) => d.id || (d.id = Math.random()));

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', () => `translate(${source.y0},${source.x0})`)
        .on('click', (event, d) => {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        });

      nodeEnter
        .append('circle')
        .attr('r', 7)
        .attr('fill', d => d._children ? '#4F46E5' : '#818CF8')
        .attr('stroke', '#C7D2FE')
        .attr('stroke-width', 2)
        .style('transition', 'all 0.3s ease')
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this)
            .attr('fill', '#312E81')
            .attr('r', 9);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .attr('fill', d._children ? '#4F46E5' : '#818CF8')
            .attr('r', 7);
        });

      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', 20)
        .attr('text-anchor', 'start')
        .style('font-size', '13px')
        .style('fill', '#1F2937')
        .text(d => d.data.name.replace(/^\d+\s-\s/, ''))
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white');

      const nodeUpdate = nodeEnter.merge(node);
      nodeUpdate
        .transition(transition)
        .attr('transform', (d) => `translate(${d.y},${d.x})`);

      nodeUpdate
        .select('circle')
        .attr('fill', (d) => (d._children ? '#555' : '#999'));

      const nodeExit = node.exit().transition(transition).remove();
      nodeExit.attr('transform', (d) => `translate(${source.y},${source.x})`).remove();

      const link = gLink.selectAll('path').data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', () => {
          let o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        });

      linkEnter.merge(link).transition(transition).attr('d', diagonal);

      link
        .exit()
        .transition(transition)
        .attr('d', () => {
          let o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();

      root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    updateRef.current = update;

    update(root);
  }, [linkedInPulseTopicsData]);

  const handleResetPosition = () => {
    if (svgInstanceRef.current && zoomRef.current && initialTransformRef.current) {
      svgInstanceRef.current
        .transition()
        .call(zoomRef.current.transform, initialTransformRef.current);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700 text-center">
          Topic Hierarchy Explorer
        </h2>
        <p className="text-gray-600 text-center mb-6 max-w-2xl mx-auto">
          Explore the hierarchical relationship between topics. Click nodes to expand/collapse, 
          use mouse wheel to zoom, and drag to pan around the visualization.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-inner">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { 
                level: 0, 
                text: 'Collapse All', 
                icon: '−',
                className: 'bg-white text-gray-700 hover:bg-gray-50 ring-gray-200'
              },
              { 
                level: 1, 
                text: 'Level 1', 
                icon: '1',
                className: 'bg-white text-indigo-600 hover:bg-indigo-50 ring-indigo-200'
              },
              { 
                level: 2, 
                text: 'Level 2', 
                icon: '2',
                className: 'bg-white text-indigo-600 hover:bg-indigo-50 ring-indigo-200'
              },
              { 
                level: 3, 
                text: 'Level 3', 
                icon: '3',
                className: 'bg-white text-indigo-600 hover:bg-indigo-50 ring-indigo-200'
              },
              { 
                level: 99, 
                text: 'Expand All', 
                icon: '+',
                className: 'bg-indigo-600 text-white hover:bg-indigo-700 ring-indigo-300'
              },
              { 
                level: 'reset', 
                text: 'Reset View', 
                icon: '↺',
                className: 'bg-white text-gray-600 hover:bg-gray-50 ring-gray-200',
                onClick: handleResetPosition
              }
            ].map(({ level, text, icon, className, onClick }) => (
              <button
                key={text}
                onClick={() => onClick ? onClick() : handleExpandLevel(level)}
                className={`
                  px-5 py-2.5
                  ring-1
                  rounded-lg
                  transition-all duration-200
                  shadow-sm
                  font-medium
                  flex items-center gap-2.5
                  hover:shadow
                  active:scale-95
                  ${className}
                `}
              >
                <span className="text-sm font-semibold">{icon}</span>
                <span className="text-sm">{text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50">
          <div className="absolute top-4 left-4 text-sm text-gray-500 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Scroll to zoom, drag to pan
            </span>
          </div>
          <svg ref={svgRef} width="100%" height="1200" className="mt-2"></svg>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleTreeTab;

