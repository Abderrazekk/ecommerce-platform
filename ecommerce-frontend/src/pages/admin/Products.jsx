import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchAdminProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from '../../redux/slices/product.slice'
import { formatPrice } from '../../utils/formatPrice'
import Loader from '../../components/common/Loader'
import { toast } from 'react-hot-toast'
import { Edit2, Trash2, Plus, X, Upload, Star, Eye, EyeOff, X as XIcon } from 'lucide-react'

const categories = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Beauty & Personal Care',
  'Home & Kitchen',
  'Fitness & Outdoors',
  'Baby & Kids',
  'Pets',
  'Automotive & Tools',
  'Lifestyle & Hobbies',
]

const Products = () => {
  const dispatch = useDispatch()
  const { products, loading } = useSelector((state) => state.products)
  
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    tags: '',
    isFeatured: false,
    isVisible: true,
  })
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const fileInputRef = useRef(null)

  // Fetch ALL products (including hidden) for admin
  useEffect(() => {
    dispatch(fetchAdminProducts({ page: 1, limit: 50 }))
  }, [dispatch])

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        brand: product.brand || '',
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || '',
        category: product.category,
        stock: product.stock,
        tags: product.tags ? product.tags.join(', ') : '',
        isFeatured: product.isFeatured || false,
        isVisible: product.isVisible !== false,
      })
      setImageFiles([])
      setImagePreviews(product.images ? product.images.map(img => img.url) : [])
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        brand: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        stock: '',
        tags: '',
        isFeatured: false,
        isVisible: true,
      })
      setImageFiles([])
      setImagePreviews([])
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      stock: '',
      tags: '',
      isFeatured: false,
      isVisible: true,
    })
    setImageFiles([])
    setImagePreviews([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file count
    const totalFiles = imageFiles.length + files.length
    if (totalFiles > 6) {
      toast.error('Maximum 6 images allowed')
      return
    }

    // Validate file types
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      return validTypes.includes(file.type)
    })

    if (validFiles.length === 0) {
      toast.error('Please select valid image files (JPEG, PNG, GIF, WebP)')
      return
    }

    // Add new files
    setImageFiles(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    const requiredFields = ['name', 'brand', 'description', 'price', 'category', 'stock']
    const missingFields = requiredFields.filter(field => !formData[field])
    
    if (missingFields.length > 0) {
      toast.error(`Please fill all required fields: ${missingFields.join(', ')}`)
      return
    }

    // Validate images
    if (!editingProduct && imageFiles.length === 0) {
      toast.error('Please upload at least one product image')
      return
    }

    // Validate discount price
    if (formData.discountPrice && parseFloat(formData.discountPrice) >= parseFloat(formData.price)) {
      toast.error('Discount price must be less than original price')
      return
    }

    const productData = new FormData()
    productData.append('name', formData.name)
    productData.append('brand', formData.brand)
    productData.append('description', formData.description)
    productData.append('price', formData.price)
    
    if (formData.discountPrice) {
      productData.append('discountPrice', formData.discountPrice)
    }
    
    productData.append('category', formData.category)
    productData.append('stock', formData.stock)
    productData.append('tags', formData.tags)
    productData.append('isFeatured', formData.isFeatured)
    productData.append('isVisible', formData.isVisible)
    
    // Append images if we have new files
    imageFiles.forEach((file, index) => {
      productData.append('images', file)
    })

    try {
      if (editingProduct) {
        await dispatch(updateProduct({ 
          id: editingProduct._id, 
          productData 
        })).unwrap()
        toast.success('Product updated successfully!')
      } else {
        await dispatch(createProduct(productData)).unwrap()
        toast.success('Product created successfully!')
      }
      
      handleCloseModal()
    } catch (error) {
      console.error('Error saving product:', error)
      // Error toast is already handled in the slice
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await dispatch(deleteProduct(id))
    }
  }

  // Calculate discount percentage
  const calculateDiscountPercentage = () => {
    if (formData.discountPrice && formData.price) {
      const discount = ((formData.price - formData.discountPrice) / formData.price) * 100
      return Math.round(discount)
    }
    return 0
  }

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600">Manage your product catalog (including hidden products)</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name & Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className={`hover:bg-gray-50 ${!product.isVisible ? 'bg-gray-100' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex -space-x-2">
                        {product.images?.slice(0, 3).map((img, index) => (
                          <img
                            key={index}
                            src={img.url}
                            alt={`${product.name} ${index + 1}`}
                            className="h-10 w-10 object-cover rounded-full border-2 border-white"
                          />
                        ))}
                        {product.images?.length > 3 && (
                          <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold">
                            +{product.images.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.brand}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {product.tags?.slice(0, 3).map(tag => `#${tag}`).join(' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {product.isFeatured && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                        {!product.isVisible && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hidden
                          </span>
                        )}
                        {product.discountPrice && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {product.discountPrice ? (
                          <>
                            <div className="font-semibold text-green-600">
                              {formatPrice(product.discountPrice)}
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          </>
                        ) : (
                          <div className="font-semibold">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock > 10 ? 'bg-green-100 text-green-800' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit2 className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found. Add your first product!</p>
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Product Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Images {!editingProduct && '*'}
                        <span className="ml-2 text-xs text-gray-500">
                          ({imagePreviews.length}/6 images)
                        </span>
                      </label>
                      
                      {/* Image Previews */}
                      {imagePreviews.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="h-32 w-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <XIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-1">
                        <label className="cursor-pointer block">
                          <div className="flex flex-col items-center justify-center h-48 w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-gray-50">
                            {imagePreviews.length === 0 ? (
                              <div className="text-center p-4">
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-sm text-gray-600">
                                  Click to upload product images
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  PNG, JPG, GIF, WebP up to 5MB each
                                </p>
                                <p className="text-xs text-gray-500">
                                  Minimum 1 image, Maximum 6 images
                                </p>
                              </div>
                            ) : (
                              <div className="text-center p-4">
                                <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">
                                  Click to add more images
                                </p>
                                <p className="text-xs text-gray-500">
                                  {6 - imagePreviews.length} images remaining
                                </p>
                              </div>
                            )}
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            disabled={imagePreviews.length >= 6}
                          />
                        </label>
                      </div>
                      {imagePreviews.length === 0 && !editingProduct && (
                        <p className="text-red-500 text-sm mt-1">
                          At least one image is required for new products
                        </p>
                      )}
                    </div>

                    {/* Product Name and Brand */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand *
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          placeholder="Enter brand name"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        className="input-field"
                        placeholder="Enter product description"
                      />
                    </div>

                    {/* Price, Discount Price, and Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Original Price *
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="input-field"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Price
                        </label>
                        <input
                          type="number"
                          name="discountPrice"
                          value={formData.discountPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="input-field"
                          placeholder="Optional"
                        />
                        {formData.discountPrice && formData.price && (
                          <p className="text-green-600 text-sm mt-1">
                            {calculateDiscountPercentage()}% OFF
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="input-field"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Category and Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </label>
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="tag1, tag2, tag3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separate tags with commas
                        </p>
                      </div>
                    </div>

                    {/* Product Visibility Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
                          <span className="font-medium">Featured Product</span>
                          <p className="text-xs text-gray-500">Appears in homepage featured section</p>
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isVisible"
                          name="isVisible"
                          checked={formData.isVisible}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary-600 rounded"
                        />
                        <label htmlFor="isVisible" className="ml-2 block text-sm text-gray-700">
                          <span className="font-medium">Visible in Shop</span>
                          <p className="text-xs text-gray-500">Customers can see this product</p>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={!editingProduct && imageFiles.length === 0}
                      >
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products;