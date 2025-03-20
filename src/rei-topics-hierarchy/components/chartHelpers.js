// Count leaf articles to avoid double counting
function countLeafArticles(node) {
  if (!node.children || node.children.length === 0) {
    return node.articleCount || 0;
  }
  return node.children.reduce((sum, child) => sum + countLeafArticles(child), 0);
}

function getAllNodesAtLevel(node, targetLevel, results = []) {
  if (node.level === targetLevel) {
    results.push(node);
  }
  if (node.children) {
    node.children.forEach((child) => {
      getAllNodesAtLevel(child, targetLevel, results);
    });
  }
  return results;
}

// 1) L1 Bar Chart
export function getL1BarChartData(root) {
  if (!root.children) return { labels: [], datasets: [] };

  const labels = [];
  const data = [];

  root.children.forEach((l1Node) => {
    const totalArticles = countLeafArticles(l1Node);
    labels.push(l1Node.name.replace(/^\d+\s-\s/, ''));
    data.push(totalArticles);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Articles under L1',
        data,
        backgroundColor: '#6366F1'
      }
    ]
  };
}

// 2) L2 Stacked Data
export function getL1L2StackedData(root) {
  if (!root.children) return { labels: [], datasets: [] };

  const labels = [];
  const bucket1Arr = [];
  const bucket2to5Arr = [];
  const bucket6to10Arr = [];
  const bucket11to20Arr = [];
  const bucket21plusArr = [];

  root.children.forEach((l1Node) => {
    labels.push(l1Node.name.replace(/^\d+\s-\s/, ''));
    let c1 = 0,
      c2to5 = 0,
      c6to10 = 0,
      c11to20 = 0,
      c21plus = 0;

    const l2Nodes = getAllNodesAtLevel(l1Node, 2);
    l2Nodes.forEach((l2Node) => {
      const totalArticlesUnderL2 = countLeafArticles(l2Node);
      if (totalArticlesUnderL2 === 1) c1++;
      else if (totalArticlesUnderL2 >= 2 && totalArticlesUnderL2 <= 5) c2to5++;
      else if (totalArticlesUnderL2 >= 6 && totalArticlesUnderL2 <= 10) c6to10++;
      else if (totalArticlesUnderL2 >= 11 && totalArticlesUnderL2 <= 20)
        c11to20++;
      else if (totalArticlesUnderL2 >= 21) c21plus++;
    });

    bucket1Arr.push(c1);
    bucket2to5Arr.push(c2to5);
    bucket6to10Arr.push(c6to10);
    bucket11to20Arr.push(c11to20);
    bucket21plusArr.push(c21plus);
  });

  return {
    labels,
    datasets: [
      {
        label: '1 article',
        data: bucket1Arr,
        backgroundColor: '#E9D5FF'
      },
      {
        label: '2–5 articles',
        data: bucket2to5Arr,
        backgroundColor: '#C4B5FD'
      },
      {
        label: '6–10 articles',
        data: bucket6to10Arr,
        backgroundColor: '#A78BFA'
      },
      {
        label: '11–20 articles',
        data: bucket11to20Arr,
        backgroundColor: '#818CF8'
      },
      {
        label: '21+ articles',
        data: bucket21plusArr,
        backgroundColor: '#6366F1'
      }
    ]
  };
}

// 3) L3 Stacked Data
export function getL1L3StackedData(root) {
  if (!root.children) return { labels: [], datasets: [] };

  const labels = [];
  const bucket1Arr = [];
  const bucket2to5Arr = [];
  const bucket6to10Arr = [];
  const bucket11to20Arr = [];
  const bucket21plusArr = [];

  root.children.forEach((l1Node) => {
    labels.push(l1Node.name.replace(/^\d+\s-\s/, ''));
    let c1 = 0,
      c2to5 = 0,
      c6to10 = 0,
      c11to20 = 0,
      c21plus = 0;

    const l3Nodes = getAllNodesAtLevel(l1Node, 3);
    l3Nodes.forEach((l3Node) => {
      const totalArticlesUnderL3 = countLeafArticles(l3Node);
      if (totalArticlesUnderL3 === 1) c1++;
      else if (totalArticlesUnderL3 >= 2 && totalArticlesUnderL3 <= 5) c2to5++;
      else if (totalArticlesUnderL3 >= 6 && totalArticlesUnderL3 <= 10) c6to10++;
      else if (totalArticlesUnderL3 >= 11 && totalArticlesUnderL3 <= 20)
        c11to20++;
      else if (totalArticlesUnderL3 >= 21) c21plus++;
    });

    bucket1Arr.push(c1);
    bucket2to5Arr.push(c2to5);
    bucket6to10Arr.push(c6to10);
    bucket11to20Arr.push(c11to20);
    bucket21plusArr.push(c21plus);
  });

  return {
    labels,
    datasets: [
      {
        label: '1 article',
        data: bucket1Arr,
        backgroundColor: '#E9D5FF'
      },
      {
        label: '2–5 articles',
        data: bucket2to5Arr,
        backgroundColor: '#C4B5FD'
      },
      {
        label: '6–10 articles',
        data: bucket6to10Arr,
        backgroundColor: '#A78BFA'
      },
      {
        label: '11–20 articles',
        data: bucket11to20Arr,
        backgroundColor: '#818CF8'
      },
      {
        label: '21+ articles',
        data: bucket21plusArr,
        backgroundColor: '#6366F1'
      }
    ]
  };
}

export function getL2BarChartData(topicsData) {
  // Initialize an object to store L2 topic counts and their parent L1 topics
  const l2Info = {};
  
  // Function to traverse the tree and collect L2 topics
  const traverseTree = (node, parentL1 = null) => {
    if (node.level === 1) {
      // This is an L1 node, remember it for its children
      parentL1 = node.name.replace(/^\d+\s-\s/, '');
    } else if (node.level === 2 && parentL1) {
      // Extract the name (removing any numbering if present)
      const name = node.name.replace(/^\d+\s-\s/, '');
      
      // Create a combined label with L1/L2 format
      const combinedLabel = `${parentL1}/ ${name}`;
      
      // If this L2 doesn't exist yet, initialize it
      if (!l2Info[combinedLabel]) {
        l2Info[combinedLabel] = {
          count: 0,
          parentL1: parentL1,
          l2Name: name
        };
      }
      
      // Count the articles for this L2 topic
      l2Info[combinedLabel].count += (node.articleCount || 0);
    }
    
    // Recursively process children
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverseTree(child, parentL1));
    }
  };
  
  // Start traversal from the root
  traverseTree(topicsData);
  
  // Convert the info object to arrays for Chart.js
  const labels = Object.keys(l2Info);
  const data = labels.map(label => l2Info[label].count);
  const parentL1s = labels.map(label => l2Info[label].parentL1);
  const l2Names = labels.map(label => l2Info[label].l2Name);
  
  // Sort by count (descending)
  const combined = labels.map((label, i) => ({ 
    label, 
    value: data[i],
    parentL1: parentL1s[i],
    l2Name: l2Names[i]
  }));
  combined.sort((a, b) => b.value - a.value);
  
  // Extract sorted labels and data
  const sortedLabels = combined.map(item => item.label);
  const sortedData = combined.map(item => item.value);
  const sortedParentL1s = combined.map(item => item.parentL1);
  const sortedL2Names = combined.map(item => item.l2Name);
  
  return {
    labels: sortedLabels,
    datasets: [
      {
        label: 'Article Count',
        data: sortedData,
        backgroundColor: '#60A5FA', // A blue color
        borderColor: '#2563EB',
        borderWidth: 1,
        // Store parent L1 info for each data point
        parentL1s: sortedParentL1s,
        l2Names: sortedL2Names
      }
    ]
  };
}

