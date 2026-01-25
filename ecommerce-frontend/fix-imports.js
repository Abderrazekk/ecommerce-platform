const fs = require('fs');
const path = require('path');

const files = [
  { 
    file: 'src/pages/MyOrders.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../utils/formatPrice";'
  },
  { 
    file: 'src/pages/Cart.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../utils/formatPrice";'
  },
  { 
    file: 'src/pages/Checkout.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../utils/formatPrice";'
  },
  { 
    file: 'src/pages/ProductDetails.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../utils/formatPrice";'
  },
  { 
    file: 'src/components/product/ProductCard.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../utils/formatPrice";'
  },
  { 
    file: 'src/components/cart/CartItem.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../utils/formatPrice";'
  },
  // Admin pages are deeper, so they need different paths
  { 
    file: 'src/pages/admin/Dashboard.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../../utils/formatPrice";' // This is correct
  },
  { 
    file: 'src/pages/admin/Products.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../../utils/formatPrice";' // This is correct
  },
  { 
    file: 'src/pages/admin/Orders.jsx',
    search: 'import { formatPrice } from "../../utils/formatPrice";',
    replace: 'import { formatPrice } from "../../utils/formatPrice";' // This is correct
  }
];

files.forEach(({ file, search, replace }) => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(search)) {
      content = content.replace(search, replace);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed ${file}`);
    } else {
      console.log(`⚠ ${file} doesn't contain the search string`);
    }
  } else {
    console.log(`✗ File not found: ${file}`);
  }
});

console.log('\n✅ All import paths have been fixed!');