import { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAdminProducts,
  deleteProduct,
  createProduct,
  updateProduct,
} from "../../redux/slices/product.slice";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";
import { toast } from "react-hot-toast";
import {
  Edit2,
  Trash2,
  Plus,
  X,
  Upload,
  Star,
  Eye,
  EyeOff,
  X as XIcon,
  Video,
  Film,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Grid,
  List,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Package,
  DollarSign,
  Tag,
  MoreVertical,
} from "lucide-react";

const categories = [
  "Electronics & Gadgets",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Fitness & Outdoors",
  "Baby & Kids",
  "Pets",
  "Automotive & Tools",
  "Lifestyle & Hobbies",
];

const Products = () => {
  const dispatch = useDispatch();
  const {
    products,
    loading,
    brands: allBrands,
  } = useSelector((state) => state.products);

  // States
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    stock: "",
    tags: "",
    isFeatured: false,
    isVisible: true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedVisibility, setSelectedVisibility] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [selectedFeatured, setSelectedFeatured] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch ALL products (including hidden) for admin
  useEffect(() => {
    dispatch(fetchAdminProducts({ page: 1, limit: 50 }));
  }, [dispatch]);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.brand.toLowerCase().includes(query) ||
            (product.tags &&
              product.tags.some((tag) => tag.toLowerCase().includes(query)));
          if (!matchesSearch) return false;
        }

        // Category filter
        if (
          selectedCategory !== "all" &&
          product.category !== selectedCategory
        ) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== "all" && product.brand !== selectedBrand) {
          return false;
        }

        // Visibility filter
        if (selectedVisibility === "visible" && !product.isVisible) {
          return false;
        }
        if (selectedVisibility === "hidden" && product.isVisible) {
          return false;
        }

        // Featured filter
        if (selectedFeatured === "featured" && !product.isFeatured) {
          return false;
        }
        if (selectedFeatured === "not-featured" && product.isFeatured) {
          return false;
        }

        // Stock filter
        if (selectedStock === "in-stock" && product.stock === 0) {
          return false;
        }
        if (
          selectedStock === "low-stock" &&
          (product.stock > 5 || product.stock === 0)
        ) {
          return false;
        }
        if (selectedStock === "out-of-stock" && product.stock > 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "price-high":
            return (b.discountPrice || b.price) - (a.discountPrice || a.price);
          case "price-low":
            return (a.discountPrice || a.price) - (b.discountPrice || b.price);
          case "stock-high":
            return b.stock - a.stock;
          case "stock-low":
            return a.stock - b.stock;
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedVisibility,
    selectedStock,
    selectedFeatured,
    sortBy,
  ]);

  // Get unique brands from products
  const brands = useMemo(() => {
    const brandSet = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [products]);

  // Get product statistics
  const productStats = useMemo(() => {
    const totalProducts = products.length;
    const visibleProducts = products.filter((p) => p.isVisible).length;
    const featuredProducts = products.filter((p) => p.isFeatured).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

    return {
      total: totalProducts,
      visible: visibleProducts,
      featured: featuredProducts,
      outOfStock,
      lowStock,
      withDiscount: products.filter((p) => p.discountPrice).length,
      withVideo: products.filter((p) => p.video).length,
    };
  }, [products]);

  // Modal functions
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand || "",
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || "",
        category: product.category,
        stock: product.stock,
        tags: product.tags ? product.tags.join(", ") : "",
        isFeatured: product.isFeatured || false,
        isVisible: product.isVisible !== false,
      });
      setImageFiles([]);
      setImagePreviews(
        product.images ? product.images.map((img) => img.url) : [],
      );
      setVideoFile(null);
      setVideoPreview(product.video || null);
      setRemoveExistingVideo(false);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        brand: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "",
        stock: "",
        tags: "",
        isFeatured: false,
        isVisible: true,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
      setRemoveExistingVideo(false);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      stock: "",
      tags: "",
      isFeatured: false,
      isVisible: true,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
    setRemoveExistingVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file count
    const totalFiles = imageFiles.length + files.length;
    if (totalFiles > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    // Validate file types
    const validFiles = files.filter((file) => {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length === 0) {
      toast.error("Please select valid image files (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 10MB)
    const oversizedFiles = validFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      toast.error("Image file size must be less than 10MB");
      return;
    }

    // Add new files
    setImageFiles((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setRemoveExistingVideo(false);

    if (!file) {
      setVideoFile(null);
      setVideoPreview(null);
      return;
    }

    // Validate file type
    const validTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
      "video/flv",
      "video/wmv",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error(
        "Please select a valid video file (MP4, MOV, AVI, MKV, WebM, FLV, WMV)",
      );
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must be less than 50MB");
      return;
    }

    setVideoFile(file);

    // Create video preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (editingProduct?.video && !videoFile) {
      setRemoveExistingVideo(true);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "name",
      "brand",
      "description",
      "price",
      "category",
      "stock",
    ];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    // Validate images
    if (!editingProduct && imageFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    // For updates: If no new images selected, we need to keep existing ones
    if (
      editingProduct &&
      imageFiles.length === 0 &&
      imagePreviews.length === 0
    ) {
      toast.error("Product must have at least one image");
      return;
    }

    // Validate discount price
    const discountPriceStr = String(formData.discountPrice || "");
    if (discountPriceStr && discountPriceStr.trim() !== "") {
      const priceNum = parseFloat(formData.price);
      const discountNum = parseFloat(discountPriceStr);

      // Check if discount is a valid number
      if (isNaN(discountNum)) {
        toast.error("Discount price must be a valid number");
        return;
      }

      // Check if discount is positive
      if (discountNum < 0) {
        toast.error("Discount price cannot be negative");
        return;
      }

      // Check if discount is less than price with a small tolerance
      if (discountNum >= priceNum - 0.001) {
        toast.error("Discount price must be less than original price");
        return;
      }
    }

    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("brand", formData.brand);
    productData.append("description", formData.description);
    productData.append("price", String(formData.price));

    // Handle discountPrice - send empty string to clear it, or the value
    if (discountPriceStr && discountPriceStr.trim() !== "") {
      const discountNum = parseFloat(discountPriceStr);
      if (!isNaN(discountNum) && discountNum > 0) {
        productData.append("discountPrice", String(discountNum));
      } else {
        productData.append("discountPrice", "");
      }
    } else {
      productData.append("discountPrice", "");
    }

    productData.append("category", formData.category);
    productData.append("stock", formData.stock);
    productData.append("tags", formData.tags);
    productData.append("isFeatured", formData.isFeatured);
    productData.append("isVisible", formData.isVisible);

    // Append images if we have new files
    imageFiles.forEach((file, index) => {
      productData.append("images", file);
    });

    // Append video if exists
    if (videoFile) {
      productData.append("video", videoFile);
    }

    // Tell backend if we want to remove existing video
    if (editingProduct && removeExistingVideo && !videoFile) {
      productData.append("removeVideo", "true");
    }

    try {
      if (editingProduct) {
        await dispatch(
          updateProduct({
            id: editingProduct._id,
            productData,
          }),
        ).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success("Product created successfully!");
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
      // Error toast is already handled in the slice
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      await dispatch(deleteProduct(id));
    }
  };

  const handleQuickUpdate = async (id, field, value) => {
    try {
      const productData = new FormData();
      productData.append(field, value);

      await dispatch(
        updateProduct({
          id: id,
          productData,
        }),
      ).unwrap();
      toast.success("Product updated!");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedVisibility("all");
    setSelectedStock("all");
    setSelectedFeatured("all");
    setSortBy("newest");
  };

  // Calculate discount percentage
  const calculateDiscountPercentage = () => {
    if (formData.discountPrice && formData.price) {
      const discount =
        ((formData.price - formData.discountPrice) / formData.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product catalog • {filteredProducts.length} products
                found
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.total}
                  </p>
                </div>
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Package className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Visible</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.visible}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.featured}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.outOfStock}
                  </p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.lowStock}
                  </p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">On Discount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.withDiscount}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Video</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {productStats.withVideo}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Film className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, brand, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none transition-all"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  <Grid className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                >
                  <List className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <button
                onClick={() => setExpandedFilters(!expandedFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium">Filters</span>
                {expandedFilters ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl transition-colors"
                title="Reset all filters"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {expandedFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Visibility Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    value={selectedVisibility}
                    onChange={(e) => setSelectedVisibility(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="visible">Visible Only</option>
                    <option value="hidden">Hidden Only</option>
                  </select>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Status
                  </label>
                  <select
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock (≤5)</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured
                  </label>
                  <select
                    value={selectedFeatured}
                    onChange={(e) => setSelectedFeatured(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="featured">Featured Only</option>
                    <option value="not-featured">Not Featured</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="stock-high">Stock: High to Low</option>
                    <option value="stock-low">Stock: Low to High</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Badges */}
              {(selectedCategory !== "all" ||
                selectedBrand !== "all" ||
                selectedVisibility !== "all" ||
                selectedStock !== "all" ||
                selectedFeatured !== "all") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                      Category: {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      Brand: {selectedBrand}
                      <button
                        onClick={() => setSelectedBrand("all")}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedVisibility !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      {selectedVisibility === "visible"
                        ? "Visible Only"
                        : "Hidden Only"}
                      <button
                        onClick={() => setSelectedVisibility("all")}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedStock !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                      {selectedStock === "in-stock"
                        ? "In Stock"
                        : selectedStock === "low-stock"
                          ? "Low Stock"
                          : "Out of Stock"}
                      <button
                        onClick={() => setSelectedStock("all")}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedFeatured !== "all" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      {selectedFeatured === "featured"
                        ? "Featured Only"
                        : "Not Featured"}
                      <button
                        onClick={() => setSelectedFeatured("all")}
                        className="ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={product.images?.[0]?.url || ""}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {!product.isVisible && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        <EyeOff className="h-3 w-3 inline mr-1" />
                        Hidden
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                        <Star className="h-3 w-3 inline mr-1" />
                        Featured
                      </span>
                    )}
                    {product.discountPrice && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        {Math.round(
                          ((product.price - product.discountPrice) /
                            product.price) *
                            100,
                        )}
                        % OFF
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-primary-50 hover:text-primary-600 transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Video Indicator */}
                  {product.video && (
                    <div className="absolute bottom-3 left-3 p-2 bg-purple-600 text-white rounded-full">
                      <Film className="h-4 w-4" />
                    </div>
                  )}

                  {/* Stock Overlay */}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-white px-4 py-2 rounded-lg font-bold text-gray-900">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(product.discountPrice || product.price)}
                      </span>
                      {product.discountPrice && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs font-bold text-green-600">
                            Save{" "}
                            {formatPrice(product.price - product.discountPrice)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-400 rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${product.stock === 0 ? "bg-red-500" : product.stock <= 5 ? "bg-orange-500" : "bg-green-500"}`}
                      />
                      <span className="text-sm font-medium">
                        {product.stock === 0
                          ? "Out of stock"
                          : `${product.stock} units`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuickUpdate(
                            product._id,
                            "isFeatured",
                            !product.isFeatured,
                          )
                        }
                        className={`p-1 rounded ${product.isFeatured ? "text-yellow-600 hover:text-yellow-700" : "text-gray-400 hover:text-gray-600"}`}
                        title={
                          product.isFeatured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleQuickUpdate(
                            product._id,
                            "isVisible",
                            !product.isVisible,
                          )
                        }
                        className={`p-1 rounded ${product.isVisible ? "text-green-600 hover:text-green-700" : "text-red-400 hover:text-red-600"}`}
                        title={
                          product.isVisible ? "Hide product" : "Show product"
                        }
                      >
                        {product.isVisible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <img
                              src={product.images?.[0]?.url || ""}
                              alt={product.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand}
                            </div>
                            <div className="text-xs text-gray-400">
                              {product.tags
                                ?.slice(0, 2)
                                .map((tag) => `#${tag}`)
                                .join(" ")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(product.discountPrice || product.price)}
                        </div>
                        {product.discountPrice && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-2 ${product.stock === 0 ? "bg-red-500" : product.stock <= 5 ? "bg-orange-500" : "bg-green-500"}`}
                          />
                          <span className="text-sm">{product.stock} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 inline mr-1" />
                              Featured
                            </span>
                          )}
                          {!product.isVisible && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              <EyeOff className="h-3 w-3 inline mr-1" />
                              Hidden
                            </span>
                          )}
                          {product.video && (
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              <Film className="h-3 w-3 inline mr-1" />
                              Video
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() =>
                                    handleQuickUpdate(
                                      product._id,
                                      "isFeatured",
                                      !product.isFeatured,
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                  {product.isFeatured
                                    ? "Remove from featured"
                                    : "Mark as featured"}
                                </button>
                                <button
                                  onClick={() =>
                                    handleQuickUpdate(
                                      product._id,
                                      "isVisible",
                                      !product.isVisible,
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                  {product.isVisible
                                    ? "Hide product"
                                    : "Show product"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ||
                selectedCategory !== "all" ||
                selectedBrand !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Get started by adding your first product"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => handleOpenModal()}
                  className="btn-primary px-6 py-3"
                >
                  <Plus className="h-5 w-5 mr-2 inline" />
                  Add Product
                </button>
                {(searchQuery ||
                  selectedCategory !== "all" ||
                  selectedBrand !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing{" "}
              <span className="font-semibold">{filteredProducts.length}</span>{" "}
              of <span className="font-semibold">{products.length}</span>{" "}
              products
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  dispatch(fetchAdminProducts({ page: 1, limit: 50 }))
                }
                className="flex items-center gap-2 text-primary-600 hover:text-primary-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingProduct
                      ? "Update product details"
                      : "Create a new product for your store"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Product Images */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images {!editingProduct && "*"}
                      <span className="ml-2 text-sm text-gray-500">
                        {imagePreviews.length}/6 images
                      </span>
                    </label>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <XIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <label className="cursor-pointer block">
                        <div className="flex flex-col items-center justify-center h-40 w-full border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-white transition-all">
                          {imagePreviews.length === 0 ? (
                            <div className="text-center p-4">
                              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-gray-600">
                                Drag & drop images or click to browse
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, GIF, WebP up to 10MB each
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
                  </div>

                  {/* Product Video */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Video (Optional)
                    </label>

                    {videoPreview ? (
                      <div className="mb-4">
                        <div className="relative">
                          {videoFile?.type?.startsWith("video/") ? (
                            <video
                              src={videoPreview}
                              className="w-full h-64 object-cover rounded-lg"
                              controls
                            />
                          ) : (
                            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Film className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {removeExistingVideo && (
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              ⚠️ Existing video will be removed on save
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1">
                        <label className="cursor-pointer block">
                          <div className="flex flex-col items-center justify-center h-32 w-full border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-white transition-all">
                            <div className="text-center p-4">
                              <Video className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">
                                Click to upload product video
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                MP4, MOV, AVI up to 50MB
                              </p>
                            </div>
                          </div>
                          <input
                            ref={videoInputRef}
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={handleVideoChange}
                          />
                        </label>
                      </div>
                    )}

                    {editingProduct?.video &&
                      !videoPreview &&
                      !removeExistingVideo && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Current video
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Click the X button above to remove this video
                              </p>
                            </div>
                            <a
                              href={editingProduct.video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                              View video →
                            </a>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Product Details */}
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
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter detailed product description..."
                    />
                  </div>

                  {/* Price, Discount & Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                          className="input-field w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          name="discountPrice"
                          value={formData.discountPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="input-field w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Optional"
                        />
                      </div>
                      {formData.discountPrice && formData.price && (
                        <p className="text-green-600 text-sm mt-2 font-medium">
                          {calculateDiscountPercentage()}% discount
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
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Category & Tags */}
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
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Separate tags with commas
                      </p>
                    </div>
                  </div>

                  {/* Quick Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="isFeatured"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Featured Product
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Show this product in featured sections
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          id="isVisible"
                          name="isVisible"
                          checked={formData.isVisible}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="isVisible"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Visible in Store
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Customers can see and purchase this product
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                      disabled={!editingProduct && imageFiles.length === 0}
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
