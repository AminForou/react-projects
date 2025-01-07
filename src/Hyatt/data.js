let sitemapData = [];

export const getSitemapData = () => sitemapData;

export const saveSitemapData = (data) => {
  sitemapData = data;
  console.log('Sitemap data saved:', sitemapData);
  // In a real application, you might want to use localStorage or make an API call here
};
