import { formatPrice } from './formatPrice';
import { formatDate } from './dateUtils';

// Convert data to CSV format
export const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const items = Array.isArray(data) ? data : [data];
  
  if (items.length === 0) return '';
  
  // Get all possible keys from all items
  const allKeys = new Set();
  items.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  
  const headers = Array.from(allKeys);
  
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  items.forEach(item => {
    const row = headers.map(header => {
      let value = item[header];
      
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle dates
      if (header.toLowerCase().includes('date') || header.toLowerCase().includes('time')) {
        value = formatDate(value, 'datetime');
      }
      
      // Handle prices/currency
      if (header.toLowerCase().includes('price') || 
          header.toLowerCase().includes('revenue') || 
          header.toLowerCase().includes('total')) {
        value = formatPrice(value).replace('$', '');
      }
      
      // Handle nested objects
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          value = value.join('; ');
        } else {
          value = JSON.stringify(value);
        }
      }
      
      // Escape quotes and commas
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    });
    
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

// Download CSV file
export const downloadCSV = (data, filename = 'export') => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Download JSON file
export const downloadJSON = (data, filename = 'export') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Export chart as image
export const exportChartAsImage = (chartRef, filename = 'chart') => {
  if (!chartRef || !chartRef.current) return;
  
  const svg = chartRef.current.querySelector('svg');
  if (!svg) return;
  
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const png = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = png;
    a.download = `${filename}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
};

// Format data for specific export types
export const formatExportData = (data, type) => {
  switch (type) {
    case 'orders':
      return data.map(order => ({
        'Order ID': order._id,
        'Customer': order.user?.name || 'Guest',
        'Email': order.user?.email || '',
        'Total Amount': formatPrice(order.totalPrice).replace('$', ''),
        'Status': order.status,
        'Date': formatDate(order.createdAt, 'datetime'),
        'Items': order.items?.map(item => `${item.name} (${item.quantity}x)`).join(', ') || '',
        'Delivery Address': order.deliveryAddress || '',
        'Phone': order.phone || ''
      }));
    
    case 'products':
      return data.map(product => ({
        'Product ID': product._id,
        'Name': product.name,
        'Brand': product.brand,
        'Category': product.category,
        'Price': formatPrice(product.price).replace('$', ''),
        'Discount Price': product.discountPrice ? formatPrice(product.discountPrice).replace('$', '') : '',
        'Stock': product.stock,
        'Status': product.isVisible ? 'Visible' : 'Hidden',
        'Featured': product.isFeatured ? 'Yes' : 'No',
        'Tags': product.tags?.join(', ') || '',
        'Created': formatDate(product.createdAt, 'datetime')
      }));
    
    case 'users':
      return data.map(user => ({
        'User ID': user._id,
        'Name': user.name,
        'Email': user.email,
        'Role': user.role,
        'Status': user.isBanned ? 'Banned' : 'Active',
        'Auth Method': user.authMethod,
        'Phone': user.phone || '',
        'Address': user.address || '',
        'Created': formatDate(user.createdAt, 'datetime'),
        'Banned Reason': user.banReason || ''
      }));
    
    case 'revenue':
      return data.map(item => ({
        'Date': item.period || item.date,
        'Revenue': formatPrice(item.revenue).replace('$', ''),
        'Orders': item.orders,
        'Average Order Value': formatPrice(item.averageOrderValue || item.avgOrderValue || 0).replace('$', ''),
        'Products Sold': item.productsSold || 'N/A'
      }));
    
    default:
      return data;
  }
};