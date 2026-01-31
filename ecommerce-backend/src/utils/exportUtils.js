const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Convert data to CSV format
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  // Handle different data structures
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Single object, convert to array
    data = [data];
  }
  
  const items = Array.isArray(data) ? data : [];
  
  if (items.length === 0) return '';
  
  // Get headers from first item
  const headers = Object.keys(items[0]);
  
  // Create CSV rows
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  items.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      
      // Handle different value types
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'object') {
        // Stringify objects
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      
      // Escape quotes in strings
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

// Generate PDF report
const generatePDFReport = async (data, reportType) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      
      // Add title
      doc.fontSize(20).text(`E-commerce Analytics Report`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Report Type: ${reportType}`, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);
      
      // Add content based on report type
      switch (reportType) {
        case 'summary':
          generateSummaryPDF(doc, data);
          break;
        case 'orders':
          generateOrdersPDF(doc, data);
          break;
        case 'products':
          generateProductsPDF(doc, data);
          break;
        case 'users':
          generateUsersPDF(doc, data);
          break;
        case 'revenue':
          generateRevenuePDF(doc, data);
          break;
        default:
          generateGenericPDF(doc, data, reportType);
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper functions for different report types
const generateSummaryPDF = (doc, data) => {
  doc.fontSize(16).text('Dashboard Summary', { underline: true });
  doc.moveDown();
  
  if (data.summary) {
    const summary = data.summary;
    doc.fontSize(12);
    doc.text(`Total Users: ${summary.totalUsers}`);
    doc.text(`Total Products: ${summary.totalProducts}`);
    doc.text(`Total Orders: ${summary.totalOrders}`);
    doc.text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
    doc.text(`Pending Orders: ${summary.pendingOrders}`);
    doc.text(`Low Stock Products: ${summary.lowStockProducts}`);
    doc.moveDown();
  }
  
  if (data.period) {
    doc.text(`Period: ${data.period}`);
    doc.text(`Last Updated: ${new Date(data.updatedAt).toLocaleString()}`);
  }
};

const generateOrdersPDF = (doc, orders) => {
  doc.fontSize(16).text('Orders Report', { underline: true });
  doc.moveDown();
  
  if (orders.length === 0) {
    doc.text('No orders found.');
    return;
  }
  
  // Create table headers
  const headers = ['Order ID', 'Customer', 'Total', 'Status', 'Date'];
  const columnWidths = [100, 150, 80, 80, 100];
  
  // Draw headers
  doc.font('Helvetica-Bold');
  let x = 50;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y, { width: columnWidths[i] });
    x += columnWidths[i];
  });
  doc.moveDown();
  
  // Draw data rows
  doc.font('Helvetica');
  orders.slice(0, 50).forEach(order => { // Limit to 50 rows
    x = 50;
    const rowData = [
      order._id.substring(0, 8) + '...',
      order.user?.name || 'N/A',
      `$${order.totalPrice?.toFixed(2) || '0.00'}`,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ];
    
    rowData.forEach((cell, i) => {
      doc.text(cell, x, doc.y, { width: columnWidths[i] });
      x += columnWidths[i];
    });
    
    doc.moveDown();
  });
};

const generateProductsPDF = (doc, products) => {
  doc.fontSize(16).text('Products Report', { underline: true });
  doc.moveDown();
  
  if (products.length === 0) {
    doc.text('No products found.');
    return;
  }
  
  const headers = ['Name', 'Category', 'Price', 'Stock', 'Status'];
  const columnWidths = [150, 100, 80, 60, 80];
  
  doc.font('Helvetica-Bold');
  let x = 50;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y, { width: columnWidths[i] });
    x += columnWidths[i];
  });
  doc.moveDown();
  
  doc.font('Helvetica');
  products.slice(0, 50).forEach(product => {
    x = 50;
    const rowData = [
      product.name,
      product.category,
      `$${product.price?.toFixed(2)}`,
      product.stock,
      product.isVisible ? 'Visible' : 'Hidden'
    ];
    
    rowData.forEach((cell, i) => {
      doc.text(cell, x, doc.y, { width: columnWidths[i] });
      x += columnWidths[i];
    });
    
    doc.moveDown();
  });
};

const generateUsersPDF = (doc, users) => {
  doc.fontSize(16).text('Users Report', { underline: true });
  doc.moveDown();
  
  if (users.length === 0) {
    doc.text('No users found.');
    return;
  }
  
  const headers = ['Name', 'Email', 'Role', 'Created', 'Status'];
  const columnWidths = [120, 150, 60, 100, 60];
  
  doc.font('Helvetica-Bold');
  let x = 50;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y, { width: columnWidths[i] });
    x += columnWidths[i];
  });
  doc.moveDown();
  
  doc.font('Helvetica');
  users.slice(0, 50).forEach(user => {
    x = 50;
    const rowData = [
      user.name,
      user.email,
      user.role,
      new Date(user.createdAt).toLocaleDateString(),
      user.isBanned ? 'Banned' : 'Active'
    ];
    
    rowData.forEach((cell, i) => {
      doc.text(cell, x, doc.y, { width: columnWidths[i] });
      x += columnWidths[i];
    });
    
    doc.moveDown();
  });
};

const generateRevenuePDF = (doc, revenueData) => {
  doc.fontSize(16).text('Revenue Report', { underline: true });
  doc.moveDown();
  
  if (revenueData.length === 0) {
    doc.text('No revenue data found.');
    return;
  }
  
  const headers = ['Date', 'Revenue', 'Orders', 'Avg Order'];
  const columnWidths = [100, 100, 80, 100];
  
  doc.font('Helvetica-Bold');
  let x = 50;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y, { width: columnWidths[i] });
    x += columnWidths[i];
  });
  doc.moveDown();
  
  doc.font('Helvetica');
  revenueData.forEach(item => {
    x = 50;
    const rowData = [
      item.period || item.date,
      `$${item.revenue?.toFixed(2)}`,
      item.orders,
      `$${item.averageOrderValue?.toFixed(2) || item.avgOrderValue?.toFixed(2) || '0.00'}`
    ];
    
    rowData.forEach((cell, i) => {
      doc.text(cell, x, doc.y, { width: columnWidths[i] });
      x += columnWidths[i];
    });
    
    doc.moveDown();
  });
};

const generateGenericPDF = (doc, data, reportType) => {
  doc.fontSize(16).text(`${reportType} Report`, { underline: true });
  doc.moveDown();
  
  doc.fontSize(12);
  if (Array.isArray(data)) {
    data.slice(0, 20).forEach((item, index) => {
      doc.text(`Item ${index + 1}: ${JSON.stringify(item, null, 2)}`);
      doc.moveDown(0.5);
    });
  } else {
    doc.text(JSON.stringify(data, null, 2));
  }
};

module.exports = {
  convertToCSV,
  generatePDFReport
};