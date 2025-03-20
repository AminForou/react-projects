import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

/**
 * For L1, use d.data.volume as the "count".
 * For L2 / L3, use d.data.articleCount as the "count".
 * Otherwise, 0.
 */
function getNodeArticleCount(d) {
  const lvl = d.data.level;
  if (lvl === 1) {
    return typeof d.data.volume === 'number' ? d.data.volume : 0;
  } else if (lvl === 2 || lvl === 3) {
    return typeof d.data.articleCount === 'number' ? d.data.articleCount : 0;
  }
  return 0; // For level 0 (root) or anything else
}

/**
 * Compute the maximum "count" for each of L1, L2, L3.
 * (L1 uses volume, L2/L3 use articleCount)
 */
function computeMaxArticleCountsByLevel(root) {
  // We'll track levels 1,2,3
  const maxCountPerLevel = { 1: 0, 2: 0, 3: 0 };

  root.each((d) => {
    const lvl = d.data.level;
    if (lvl === 1 || lvl === 2 || lvl === 3) {
      const c = getNodeArticleCount(d);
      if (c > maxCountPerLevel[lvl]) {
        maxCountPerLevel[lvl] = c;
      }
    }
  });

  return maxCountPerLevel;
}

/**
 * Mark anti-pattern nodes:
 * 1) Single-child chain: a node has 1 child, and that child has 1 child, etc.
 * 2) L2 or L3 nodes with only 1 article.
 */
function markAntiPatterns(root) {
  root.each((d) => {
    // Reset flag
    d.data.antiPattern = false;

    // 1) Single-child chain example:
    if (d.children && d.children.length === 1) {
      const onlyChild = d.children[0];
      if (onlyChild.children && onlyChild.children.length === 1) {
        d.data.antiPattern = true;
        onlyChild.data.antiPattern = true;
      }
    }

    // 2) L2 or L3 with <= 1 article
    const lvl = d.data.level;
    const articleCount = getNodeArticleCount(d);
    if ((lvl === 2 || lvl === 3) && articleCount <= 1) {
      d.data.antiPattern = true;
    }
  });
}

const ControlButton = ({ active, onClick, children, variant = 'default' }) => {
  const baseClasses =
    'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2';
  const variants = {
    default: active
      ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
      : 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-gray-200',
    expand: active
      ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
      : 'bg-white text-indigo-600 hover:bg-indigo-50 ring-1 ring-indigo-200',
    layout: active
      ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
      : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200',
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {children}
    </button>
  );
};

const CollapsibleTreeTab = ({ 
  linkedInPulseTopicsData, 
  datasetName = "Current",
  allDatasets = {},  // NEW: All available datasets for comparison
  datasetOptions = {} // NEW: Dataset option keys mapped to their display names
}) => {
  const svgRef = useRef(null);
  const comparisonSvgRef = useRef(null); // NEW: Reference for the comparison SVG
  const rootRef = useRef(null);
  const comparisonRootRef = useRef(null); // NEW: Reference for the comparison root
  const updateRef = useRef(null);
  const comparisonUpdateRef = useRef(null); // NEW: Reference for the comparison update function
  const zoomRef = useRef(null);
  const comparisonZoomRef = useRef(null); // NEW: Reference for the comparison zoom
  const initialTransformRef = useRef(null);
  const comparisonInitialTransformRef = useRef(null); // NEW: Reference for comparison initial transform
  const svgInstanceRef = useRef(null);
  const comparisonSvgInstanceRef = useRef(null); // NEW: Reference for comparison SVG instance

  // Toggles
  const [isRadial, setIsRadial] = useState(false);
  const [showCountsInLabel, setShowCountsInLabel] = useState(false);
  const [scaleNodeByArticles, setScaleNodeByArticles] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showAntiPatterns, setShowAntiPatterns] = useState(false);
  
  // NEW: Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonDatasetKey, setComparisonDatasetKey] = useState('');
  const [comparisonDataset, setComparisonDataset] = useState(null);

  // Keep track of the max count per level (1,2,3)
  const maxCountPerLevelRef = useRef({ 1: 0, 2: 0, 3: 0 });
  const comparisonMaxCountPerLevelRef = useRef({ 1: 0, 2: 0, 3: 0 }); // NEW: For comparison

  // Format the dataset name for display (replace camelCase with spaces)
  const formattedDatasetName = datasetName.replace(/([A-Z])/g, ' $1').trim();
  const formattedComparisonDatasetName = comparisonDatasetKey ? comparisonDatasetKey.replace(/([A-Z])/g, ' $1').trim() : '';

  // Expand/collapse up to a given level
  const expandToLevel = (root, level) => {
    if (!root) return;
    if (level > 0) {
      if (root._children) {
        root.children = root._children;
        root._children = null;
      }
      if (root.children) {
        root.children.forEach((child) => expandToLevel(child, level - 1));
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

  const handleResetPosition = () => {
    if (svgInstanceRef.current && zoomRef.current && initialTransformRef.current) {
      svgInstanceRef.current
        .transition()
        .call(zoomRef.current.transform, initialTransformRef.current);
    }
  };

  // NEW: Toggle comparison mode
  const handleToggleComparison = () => {
    if (comparisonMode && comparisonSvgRef.current) {
      // Clear the comparison view when disabling
      d3.select(comparisonSvgRef.current).selectAll('*').remove();
    }
    setComparisonMode(!comparisonMode);
  };

  // NEW: Handle comparison dataset selection
  const handleComparisonDatasetChange = (key) => {
    setComparisonDatasetKey(key);
    setComparisonDataset(allDatasets[key]);
  };

  useEffect(() => {
    if (!linkedInPulseTopicsData) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const data = linkedInPulseTopicsData;
    const width = comparisonMode ? 600 : 1200; // Adjust width if in comparison mode
    const height = 1200;
    const dx = 45;
    const dy = width / 4;

    // Create the main SVG
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [-dy / 2, -height / 2, width, height])
      .style('font', '12px Inter, sans-serif')
      .style('user-select', 'none')
      .attr('class', 'bg-gray-50 rounded-lg shadow-inner');

    svgInstanceRef.current = svg;

    const gZoom = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.05, 8])
      .on('zoom', (event) => {
        gZoom.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Initial transform
    const initialTransform = d3.zoomIdentity.translate(width / 4, 2).scale(0.8);
    initialTransformRef.current = initialTransform;
    svg.call(zoom.transform, initialTransform);

    // Groups for links and nodes
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

    // Tree and cluster layout
    const tree = d3.tree().nodeSize([dx, dy]);
    const cluster = d3
      .cluster()
      .size([2 * Math.PI, Math.min(width, height) / 2 - 100]);

    // Link generators
    const diagonal = d3
      .linkHorizontal()
      .x((d) => d.y)
      .y((d) => d.x);

    const radialDiagonal = d3
      .linkRadial()
      .angle((d) => d.x)
      .radius((d) => d.y);

    // Build hierarchy
    let root = d3.hierarchy(data);
    root.x0 = dy / 2;
    root.y0 = 0;
    rootRef.current = root;

    // Collapse top-level children by default
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    if (root.children) {
      root.children.forEach(collapse);
    }

    // Compute max "counts" for L1, L2, L3
    const maxCounts = computeMaxArticleCountsByLevel(root);
    maxCountPerLevelRef.current = maxCounts;

    function update(source) {
      // Mark/unmark anti-patterns based on toggle
      if (showAntiPatterns) {
        markAntiPatterns(root);
      } else {
        // Reset if we're hiding them
        root.each((d) => {
          d.data.antiPattern = false;
        });
      }

      let nodes = root.descendants().reverse();
      let links = root.links();

      // Radial or standard layout
      if (isRadial) {
        cluster(root);
      } else {
        tree(root);
      }

      let left = root;
      let right = root;
      root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      let treeHeight = right.x - left.x + dx * 2;

      let transition = svg
        .transition()
        .duration(400)
        .attr(
          'viewBox',
          isRadial
            ? [-width / 2, -treeHeight / 2, width, treeHeight]
            : [-dy / 2, left.x - dx, width, treeHeight]
        )
        .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch('toggle'));

      // ========== NODES ==========
      const node = gNode.selectAll('g').data(nodes, (d) => d.id || (d.id = Math.random()));

      // Enter nodes
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', () =>
          isRadial
            ? `rotate(${source.x0 * 180 / Math.PI - 90}) translate(${source.y0},0)`
            : `translate(${source.y0},${source.x0})`
        )
        .on('click', (event, d) => {
          // Toggle children on click
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        });

      // Node circle
      nodeEnter
        .append('circle')
        .attr('r', 1e-6)
        .attr('fill', (d) => {
          // Highlight if antiPattern is flagged
          if (showAntiPatterns && d.data.antiPattern) {
            return 'red';
          }
          // Otherwise original colors
          return d._children ? '#4F46E5' : '#818CF8';
        })
        .attr('stroke', (d) =>
          showAntiPatterns && d.data.antiPattern ? 'darkred' : '#C7D2FE'
        )
        .attr('stroke-width', 2)
        .on('mouseover', function () {
          d3.select(this).transition().duration(100).attr('stroke-width', 3);
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration(100).attr('stroke-width', 2);
        });

      // Node label
      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', (d) => {
          if (!isRadial) return 20;
          return d.x < Math.PI === !d.children ? 6 : -6;
        })
        .attr('text-anchor', (d) => {
          if (!isRadial) return 'start';
          return d.x < Math.PI === !d.children ? 'start' : 'end';
        })
        .attr('transform', (d) =>
          isRadial && d.x >= Math.PI ? 'rotate(180)' : null
        )
        .style('font-size', '13px')
        .style('fill', '#1F2937')
        .style('opacity', showLabels ? 1 : 0)
        .text((d) => {
          const lvl = d.data.level;
          const baseName = d.data.name.replace(/^\d+\s-\s/, '');
          if (showCountsInLabel && [1, 2, 3].includes(lvl)) {
            return `${baseName} (${getNodeArticleCount(d)})`;
          }
          return baseName;
        })
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white')
        .style('opacity', showLabels ? 1 : 0);

      // Merge old/new nodes
      const nodeUpdate = nodeEnter.merge(node);

      // Node transitions
      nodeUpdate
        .transition(transition)
        .attr('transform', (d) =>
          isRadial
            ? `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`
            : `translate(${d.y},${d.x})`
        );

      nodeUpdate
        .select('circle')
        .transition(transition)
        .attr('r', (d) => {
          const lvl = d.data.level;
          if (!scaleNodeByArticles || ![1, 2, 3].includes(lvl)) {
            return 4;
          }
          const levelMax = maxCountPerLevelRef.current[lvl] || 1;
          const nodeCount = getNodeArticleCount(d);

          // Adjust size ranges based on level
          let minR, maxR;
          if (lvl === 1) {
            minR = 2;
            maxR = 8;
          } else {
            // Smaller sizes for L2 and L3
            minR = 0.7;
            maxR = 0.9;
          }

          const ratio = levelMax === 0 ? 0 : nodeCount / levelMax;
          return minR + (maxR - minR) * ratio;
        })
        .attr('fill', (d) => {
          if (showAntiPatterns && d.data.antiPattern) {
            return 'red';
          }
          return d._children ? '#4F46E5' : '#818CF8';
        })
        .attr('stroke', (d) =>
          showAntiPatterns && d.data.antiPattern ? 'darkred' : '#C7D2FE'
        );

      // Node exit
      const nodeExit = node.exit().transition(transition).remove();
      nodeExit
        .attr('transform', (d) =>
          isRadial
            ? `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`
            : `translate(${d.y},${d.x})`
        )
        .select('circle')
        .attr('r', 1e-6);

      // ========== LINKS ==========
      const link = gLink.selectAll('path').data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', () => {
          let o = { x: source.x0, y: source.y0 };
          return isRadial
            ? radialDiagonal({ source: o, target: o })
            : diagonal({ source: o, target: o });
        });

      linkEnter
        .merge(link)
        .transition(transition)
        .attr('d', isRadial ? radialDiagonal : diagonal);

      link
        .exit()
        .transition(transition)
        .attr('d', () => {
          let o = { x: source.x, y: source.y };
          return isRadial
            ? radialDiagonal({ source: o, target: o })
            : diagonal({ source: o, target: o });
        })
        .remove();

      // Stash old positions
      root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    updateRef.current = update;
    update(root);
  }, [
    linkedInPulseTopicsData,
    isRadial,
    showCountsInLabel,
    scaleNodeByArticles,
    showLabels,
    showAntiPatterns,
    comparisonMode // Include in dependency so we adjust width when comparison mode changes
  ]);

  // NEW: Effect for rendering the comparison tree
  useEffect(() => {
    if (!comparisonMode || !comparisonDataset) return;

    // Clear any existing SVG content in the comparison view
    d3.select(comparisonSvgRef.current).selectAll('*').remove();

    const data = comparisonDataset;
    const width = 600; // Half width for comparison
    const height = 1200;
    const dx = 45;
    const dy = width / 4;

    // Create the comparison SVG
    const svg = d3
      .select(comparisonSvgRef.current)
      .attr('viewBox', [-dy / 2, -height / 2, width, height])
      .style('font', '12px Inter, sans-serif')
      .style('user-select', 'none')
      .attr('class', 'bg-gray-50 rounded-lg shadow-inner');

    comparisonSvgInstanceRef.current = svg;

    const gZoom = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.05, 8])
      .on('zoom', (event) => {
        gZoom.attr('transform', event.transform);
      });

    comparisonZoomRef.current = zoom;
    svg.call(zoom);

    // Initial transform
    const initialTransform = d3.zoomIdentity.translate(width / 4, 2).scale(0.8);
    comparisonInitialTransformRef.current = initialTransform;
    svg.call(zoom.transform, initialTransform);

    // Groups for links and nodes
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

    // Tree and cluster layout
    const tree = d3.tree().nodeSize([dx, dy]);
    const cluster = d3
      .cluster()
      .size([2 * Math.PI, Math.min(width, height) / 2 - 100]);

    // Link generators
    const diagonal = d3
      .linkHorizontal()
      .x((d) => d.y)
      .y((d) => d.x);

    const radialDiagonal = d3
      .linkRadial()
      .angle((d) => d.x)
      .radius((d) => d.y);

    // Build hierarchy
    let root = d3.hierarchy(data);
    root.x0 = dy / 2;
    root.y0 = 0;
    comparisonRootRef.current = root;

    // Collapse top-level children by default
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }
    if (root.children) {
      root.children.forEach(collapse);
    }

    // Compute max "counts" for L1, L2, L3
    const maxCounts = computeMaxArticleCountsByLevel(root);
    comparisonMaxCountPerLevelRef.current = maxCounts;

    function update(source) {
      // Mark/unmark anti-patterns based on toggle
      if (showAntiPatterns) {
        markAntiPatterns(root);
      } else {
        // Reset if we're hiding them
        root.each((d) => {
          d.data.antiPattern = false;
        });
      }

      let nodes = root.descendants().reverse();
      let links = root.links();

      // Radial or standard layout
      if (isRadial) {
        cluster(root);
      } else {
        tree(root);
      }

      let left = root;
      let right = root;
      root.eachBefore((node) => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      let treeHeight = right.x - left.x + dx * 2;

      let transition = svg
        .transition()
        .duration(400)
        .attr(
          'viewBox',
          isRadial
            ? [-width / 2, -treeHeight / 2, width, treeHeight]
            : [-dy / 2, left.x - dx, width, treeHeight]
        )
        .tween('resize', window.ResizeObserver ? null : () => () => svg.dispatch('toggle'));

      // ========== NODES ==========
      const node = gNode.selectAll('g').data(nodes, (d) => d.id || (d.id = Math.random()));

      // Enter nodes
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('transform', () =>
          isRadial
            ? `rotate(${source.x0 * 180 / Math.PI - 90}) translate(${source.y0},0)`
            : `translate(${source.y0},${source.x0})`
        )
        .on('click', (event, d) => {
          // Toggle children on click
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update(d);
        });

      // Node circle
      nodeEnter
        .append('circle')
        .attr('r', 1e-6)
        .attr('fill', (d) => {
          // Highlight if antiPattern is flagged
          if (showAntiPatterns && d.data.antiPattern) {
            return 'red';
          }
          // Otherwise original colors
          return d._children ? '#4F46E5' : '#818CF8';
        })
        .attr('stroke', (d) =>
          showAntiPatterns && d.data.antiPattern ? 'darkred' : '#C7D2FE'
        )
        .attr('stroke-width', 2)
        .on('mouseover', function () {
          d3.select(this).transition().duration(100).attr('stroke-width', 3);
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration(100).attr('stroke-width', 2);
        });

      // Node label
      nodeEnter
        .append('text')
        .attr('dy', '0.31em')
        .attr('x', (d) => {
          if (!isRadial) return 20;
          return d.x < Math.PI === !d.children ? 6 : -6;
        })
        .attr('text-anchor', (d) => {
          if (!isRadial) return 'start';
          return d.x < Math.PI === !d.children ? 'start' : 'end';
        })
        .attr('transform', (d) =>
          isRadial && d.x >= Math.PI ? 'rotate(180)' : null
        )
        .style('font-size', '13px')
        .style('fill', '#1F2937')
        .style('opacity', showLabels ? 1 : 0)
        .text((d) => {
          const lvl = d.data.level;
          const baseName = d.data.name.replace(/^\d+\s-\s/, '');
          if (showCountsInLabel && [1, 2, 3].includes(lvl)) {
            return `${baseName} (${getNodeArticleCount(d)})`;
          }
          return baseName;
        })
        .clone(true)
        .lower()
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 3)
        .attr('stroke', 'white')
        .style('opacity', showLabels ? 1 : 0);

      // Merge old/new nodes
      const nodeUpdate = nodeEnter.merge(node);

      // Node transitions
      nodeUpdate
        .transition(transition)
        .attr('transform', (d) =>
          isRadial
            ? `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`
            : `translate(${d.y},${d.x})`
        );

      nodeUpdate
        .select('circle')
        .transition(transition)
        .attr('r', (d) => {
          const lvl = d.data.level;
          if (!scaleNodeByArticles || ![1, 2, 3].includes(lvl)) {
            return 4;
          }
          const levelMax = comparisonMaxCountPerLevelRef.current[lvl] || 1;
          const nodeCount = getNodeArticleCount(d);

          // Adjust size ranges based on level
          let minR, maxR;
          if (lvl === 1) {
            minR = 2;
            maxR = 8;
          } else {
            // Smaller sizes for L2 and L3
            minR = 0.7;
            maxR = 0.9;
          }

          const ratio = levelMax === 0 ? 0 : nodeCount / levelMax;
          return minR + (maxR - minR) * ratio;
        })
        .attr('fill', (d) => {
          if (showAntiPatterns && d.data.antiPattern) {
            return 'red';
          }
          return d._children ? '#4F46E5' : '#818CF8';
        })
        .attr('stroke', (d) =>
          showAntiPatterns && d.data.antiPattern ? 'darkred' : '#C7D2FE'
        );

      // Node exit
      const nodeExit = node.exit().transition(transition).remove();
      nodeExit
        .attr('transform', (d) =>
          isRadial
            ? `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`
            : `translate(${d.y},${d.x})`
        )
        .select('circle')
        .attr('r', 1e-6);

      // ========== LINKS ==========
      const link = gLink.selectAll('path').data(links, (d) => d.target.id);

      const linkEnter = link
        .enter()
        .append('path')
        .attr('d', () => {
          let o = { x: source.x0, y: source.y0 };
          return isRadial
            ? radialDiagonal({ source: o, target: o })
            : diagonal({ source: o, target: o });
        });

      linkEnter
        .merge(link)
        .transition(transition)
        .attr('d', isRadial ? radialDiagonal : diagonal);

      link
        .exit()
        .transition(transition)
        .attr('d', () => {
          let o = { x: source.x, y: source.y };
          return isRadial
            ? radialDiagonal({ source: o, target: o })
            : diagonal({ source: o, target: o });
        })
        .remove();

      // Stash old positions
      root.eachBefore((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    comparisonUpdateRef.current = update;
    update(root);
  }, [
    comparisonMode,
    comparisonDataset,
    isRadial,
    showCountsInLabel,
    scaleNodeByArticles,
    showLabels,
    showAntiPatterns
  ]);

  // Expand both trees to the same level
  const handleExpandBothToLevel = (level) => {
    if (rootRef.current && updateRef.current) {
      expandToLevel(rootRef.current, level);
      updateRef.current(rootRef.current);
    }
    
    if (comparisonMode && comparisonRootRef.current && comparisonUpdateRef.current) {
      expandToLevel(comparisonRootRef.current, level);
      comparisonUpdateRef.current(comparisonRootRef.current);
    }
  };

  // Reset position for both trees
  const handleResetBothPositions = () => {
    if (svgInstanceRef.current && zoomRef.current && initialTransformRef.current) {
      svgInstanceRef.current
        .transition()
        .call(zoomRef.current.transform, initialTransformRef.current);
    }
    
    if (comparisonMode && comparisonSvgInstanceRef.current && 
        comparisonZoomRef.current && comparisonInitialTransformRef.current) {
      comparisonSvgInstanceRef.current
        .transition()
        .call(comparisonZoomRef.current.transform, comparisonInitialTransformRef.current);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-indigo-700 text-center">
          Topic Hierarchy Explorer <span className="text-indigo-600">({formattedDatasetName})</span>
        </h2>
        <p className="text-gray-600 text-center mb-4 max-w-2xl mx-auto">
          Explore the hierarchical relationship between topics. 
          Click nodes to expand/collapse, scroll to zoom, and drag to pan.
        </p>

        {/* NEW: Comparison Toggle and Dataset Selection */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 shadow-inner">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ControlButton
              active={comparisonMode}
              onClick={handleToggleComparison}
              variant="layout"
            >
              {comparisonMode ? 'Disable Comparison' : 'Enable Comparison'}
            </ControlButton>
            
            {comparisonMode && (
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">Compare with:</span>
                <select
                  value={comparisonDatasetKey}
                  onChange={(e) => handleComparisonDatasetChange(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white 
                    border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 
                    focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select dataset...</option>
                  {Object.keys(allDatasets).map((key) => {
                    // Skip current dataset
                    if (key === datasetName) return null;
                    return (
                      <option key={key} value={key}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Visualization Controls */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-inner">
          <div className="flex flex-col gap-4">
            {/* Display Options */}
            <div className="flex items-center justify-center gap-3 pb-4 border-b border-gray-200">
              <ControlButton
                active={showLabels}
                onClick={() => setShowLabels((prev) => !prev)}
              >
                {showLabels ? 'Hide Labels' : 'Show Labels'}
              </ControlButton>

              <ControlButton
                active={showCountsInLabel}
                onClick={() => setShowCountsInLabel((prev) => !prev)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {showCountsInLabel ? 'Hide Counts' : 'Show Counts'}
              </ControlButton>

              <ControlButton
                active={scaleNodeByArticles}
                onClick={() => setScaleNodeByArticles((prev) => !prev)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {scaleNodeByArticles ? 'Fixed Size' : 'Scale by Count'}
              </ControlButton>

              <ControlButton
                active={isRadial}
                onClick={() => setIsRadial((prev) => !prev)}
                variant="layout"
              >
                {isRadial ? 'Tree Layout' : 'Radial Layout'}
              </ControlButton>

              <ControlButton
                active={showAntiPatterns}
                onClick={() => setShowAntiPatterns((prev) => !prev)}
              >
                {showAntiPatterns ? 'Hide Anti-Patterns' : 'Show Anti-Patterns'}
              </ControlButton>
            </div>

            {/* Expansion Controls */}
            <div className="flex flex-wrap justify-center gap-2">
              <ControlButton onClick={() => handleExpandBothToLevel(0)}>
                <span className="font-mono">−</span>
                Collapse All
              </ControlButton>

              {[1, 2, 3].map((level) => (
                <ControlButton
                  key={level}
                  onClick={() => handleExpandBothToLevel(level)}
                  variant="expand"
                >
                  <span className="font-mono">{level}</span>
                  Level {level}
                </ControlButton>
              ))}

              <ControlButton onClick={() => handleExpandBothToLevel(99)} variant="expand">
                <span className="font-mono">+</span>
                Expand All
              </ControlButton>

              <ControlButton onClick={handleResetBothPositions}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset View
              </ControlButton>
            </div>
          </div>
        </div>

        {/* Trees Container */}
        <div className={`flex ${comparisonMode ? 'flex-col md:flex-row gap-4' : ''}`}>
          {/* Primary Tree */}
          <div className={`relative border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50 ${comparisonMode ? 'md:w-1/2' : 'w-full'}`}>
            <div className="absolute top-4 left-4 text-sm text-gray-500 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100 z-10">
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                {formattedDatasetName}
              </span>
            </div>
            <svg ref={svgRef} width="100%" height={comparisonMode ? "700" : "1200"} className="mt-2"></svg>
          </div>

          {/* Comparison Tree */}
          {comparisonMode && (
            <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50 md:w-1/2">
              {comparisonDataset ? (
                <>
                  <div className="absolute top-4 left-4 text-sm text-gray-500 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100 z-10">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      {formattedComparisonDatasetName}
                    </span>
                  </div>
                  <svg ref={comparisonSvgRef} width="100%" height="700" className="mt-2"></svg>
                </>
              ) : (
                <div className="h-700 flex items-center justify-center">
                  <div className="text-gray-500 text-center p-8">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                    <p className="text-lg font-medium">Select a dataset to compare</p>
                    <p className="mt-2">Choose a dataset from the dropdown above to see it side by side</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleTreeTab;
