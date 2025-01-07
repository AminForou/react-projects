
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

