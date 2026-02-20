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
  Search,
  Truck,
  Globe,
  Clock,
  Phone,
  Filter,
  XCircle,
  ChevronDown,
  Star,
  Eye,
  EyeOff,
  Tag,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
  "Anime",
];

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  // Existing states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    discountPrice: "",
    shippingFee: "",
    category: "",
    stock: "",
    tags: "",
    isFeatured: false,
    isVisible: true,
    isAliExpress: false,
    isOnSaleSection: false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [colors, setColors] = useState([]);

  // Filter & sort states
  const [filters, setFilters] = useState({
    category: "all",
    onSale: "all",
    featured: "all",
    visible: "all",
    sort: "newest",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    dispatch(fetchAdminProducts({ page: 1, limit: 50 }));
  }, [dispatch]);

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  // Filter and sort logic (frontend only)
  const filteredAndSorted = useMemo(() => {
    let result = products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q) ||
          product.brand.toLowerCase().includes(q) ||
          (product.tags &&
            product.tags.some((tag) => tag.toLowerCase().includes(q)));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "all" && product.category !== filters.category)
        return false;

      // On sale filter
      if (
        filters.onSale === "onSale" &&
        !(product.discountPrice && product.discountPrice > 0)
      )
        return false;
      if (
        filters.onSale === "notOnSale" &&
        product.discountPrice &&
        product.discountPrice > 0
      )
        return false;

      // Featured filter
      if (filters.featured === "featured" && !product.isFeatured) return false;
      if (filters.featured === "notFeatured" && product.isFeatured)
        return false;

      // Visible filter
      if (filters.visible === "visible" && product.isVisible === false)
        return false;
      if (filters.visible === "hidden" && product.isVisible !== false)
        return false;

      return true;
    });

    // Sorting
    if (filters.sort === "price-asc") {
      result.sort(
        (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price),
      );
    } else if (filters.sort === "price-desc") {
      result.sort(
        (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price),
      );
    } else if (filters.sort === "stock-asc") {
      result.sort((a, b) => a.stock - b.stock);
    } else if (filters.sort === "stock-desc") {
      result.sort((a, b) => b.stock - a.stock);
    } else if (filters.sort === "newest") {
      result.sort((a, b) => b._id.localeCompare(a._id));
    }

    return result;
  }, [products, searchQuery, filters]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      category: "all",
      onSale: "all",
      featured: "all",
      visible: "all",
      sort: "newest",
    });
  };

  // All existing handlers (unchanged)
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        brand: product.brand || "",
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice || "",
        shippingFee: product.shippingFee || "",
        category: product.category,
        stock: product.stock,
        tags: product.tags ? product.tags.join(", ") : "",
        isFeatured: product.isFeatured || false,
        isVisible: product.isVisible !== false,
        isAliExpress: product.isAliExpress || false,
        isOnSaleSection: product.isOnSaleSection || false,
      });
      setImageFiles([]);
      setImagePreviews(
        product.images ? product.images.map((img) => img.url) : [],
      );
      setVideoFile(null);
      setVideoPreview(product.video || null);
      setRemoveExistingVideo(false);
      setImagesToRemove([]);
      if (product.colors && product.colors.length > 0) {
        setColors(
          product.colors.map((c) => ({
            name: c.name,
            hex: c.hex,
            images: c.images || [],
            files: [],
            previews: c.images || [],
          })),
        );
      } else {
        setColors([]);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        brand: "",
        description: "",
        price: "",
        discountPrice: "",
        shippingFee: "",
        category: "",
        stock: "",
        tags: "",
        isFeatured: false,
        isVisible: true,
        isAliExpress: false,
        isOnSaleSection: false,
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
      setRemoveExistingVideo(false);
      setImagesToRemove([]);
      setColors([]);
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
      shippingFee: "",
      category: "",
      stock: "",
      tags: "",
      isFeatured: false,
      isVisible: true,
      isAliExpress: false,
      isOnSaleSection: false,
    });
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview(null);
    setRemoveExistingVideo(false);
    setColors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 6) {
      toast.error(
        `Maximum 6 images allowed. You already have ${imagePreviews.length} images.`,
      );
      return;
    }
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
    const oversizedFiles = validFiles.filter(
      (file) => file.size > 10 * 1024 * 1024,
    );
    if (oversizedFiles.length > 0) {
      toast.error("Image file size must be less than 10MB");
      return;
    }
    setImageFiles((prev) => [...prev, ...validFiles]);
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
    const validTypes = [
      "video/mp4",
      "video/mov",
      "video/avi",
      "video/mkv",
      "video/webm",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Please select a valid video file (MP4, MOV, AVI, MKV, WebM)",
      );
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size must be less than 50MB");
      return;
    }
    setVideoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index) => {
    const isExistingImage =
      editingProduct && index < (editingProduct.images?.length || 0);
    if (isExistingImage) {
      const imageId = editingProduct.images[index].public_id;
      setImagesToRemove((prev) => [...prev, imageId]);
    } else {
      const adjustedIndex = index - (editingProduct?.images?.length || 0);
      setImageFiles((prev) => prev.filter((_, i) => i !== adjustedIndex));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (editingProduct?.video && !videoFile) {
      setRemoveExistingVideo(true);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const handleColorImages = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Please select valid image files.");
      return;
    }
    const newColors = [...colors];
    newColors[index].files = validFiles;
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    newColors[index].previews = previews;
    setColors(newColors);
  };

  const addColor = () => {
    setColors([
      ...colors,
      { name: "", hex: "#000000", images: [], files: [], previews: [] },
    ]);
  };

  const removeColor = (index) => {
    const newColors = colors.filter((_, i) => i !== index);
    setColors(newColors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    if (!editingProduct && imageFiles.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (
      editingProduct &&
      imageFiles.length === 0 &&
      imagePreviews.length === 0
    ) {
      toast.error("Product must have at least one image");
      return;
    }
    const discountPriceStr = String(formData.discountPrice || "");
    if (discountPriceStr && discountPriceStr.trim() !== "") {
      const priceNum = parseFloat(formData.price);
      const discountNum = parseFloat(discountPriceStr);
      if (isNaN(discountNum)) {
        toast.error("Discount price must be a valid number");
        return;
      }
      if (discountNum < 0) {
        toast.error("Discount price cannot be negative");
        return;
      }
      if (discountNum >= priceNum - 0.001) {
        toast.error("Discount price must be less than original price");
        return;
      }
    }
    const shippingFeeStr = String(formData.shippingFee || "");
    if (shippingFeeStr && shippingFeeStr.trim() !== "") {
      const shippingNum = parseFloat(shippingFeeStr);
      if (isNaN(shippingNum)) {
        toast.error("Shipping fee must be a valid number");
        return;
      }
      if (shippingNum < 0) {
        toast.error("Shipping fee cannot be negative");
        return;
      }
    }
    for (let i = 0; i < colors.length; i++) {
      const color = colors[i];
      if (!color.name || !color.name.trim()) {
        toast.error(`Color #${i + 1} must have a name.`);
        return;
      }
      if (!color.hex || !/^#[0-9A-F]{6}$/i.test(color.hex)) {
        toast.error(
          `Color #${i + 1} must have a valid hex code (e.g., #FF0000).`,
        );
        return;
      }
    }

    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("brand", formData.brand);
    productData.append("description", formData.description);
    productData.append("price", String(formData.price));
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
    const shippingFeeNum = parseFloat(shippingFeeStr) || 0;
    productData.append("shippingFee", String(shippingFeeNum));
    productData.append("category", formData.category);
    productData.append("stock", formData.stock);
    productData.append("tags", formData.tags);
    productData.append("isFeatured", formData.isFeatured);
    productData.append("isVisible", formData.isVisible);
    productData.append("isAliExpress", formData.isAliExpress);
    productData.append("isOnSaleSection", formData.isOnSaleSection);
    imageFiles.forEach((file) => productData.append("images", file));
    imagesToRemove.forEach((publicId, idx) =>
      productData.append(`removeImages[${idx}]`, publicId),
    );
    if (videoFile) productData.append("video", videoFile);
    if (editingProduct && removeExistingVideo && !videoFile)
      productData.append("removeVideo", "true");
    if (colors.length > 0) {
      const colorsData = colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        images: c.images || [],
      }));
      productData.append("colors", JSON.stringify(colorsData));
      colors.forEach((color, idx) => {
        if (color.files && color.files.length > 0) {
          color.files.forEach((file) =>
            productData.append(`colorImages[${idx}]`, file),
          );
        }
      });
    }

    try {
      if (editingProduct) {
        await dispatch(
          updateProduct({ id: editingProduct._id, productData }),
        ).unwrap();
        toast.success("Product updated successfully!");
      } else {
        await dispatch(createProduct(productData)).unwrap();
        toast.success("Product created successfully!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
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

  if (loading) return <Loader />;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            {filteredAndSorted.length}{" "}
            {filteredAndSorted.length === 1 ? "product" : "products"} total
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-button hover:shadow-button-hover"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl shadow-card p-5 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, description, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* On Sale Filter */}
          <select
            value={filters.onSale}
            onChange={(e) => setFilters({ ...filters, onSale: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All (Sale)</option>
            <option value="onSale">On Sale</option>
            <option value="notOnSale">Not on Sale</option>
          </select>

          {/* Featured Filter */}
          <select
            value={filters.featured}
            onChange={(e) =>
              setFilters({ ...filters, featured: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All (Featured)</option>
            <option value="featured">Featured</option>
            <option value="notFeatured">Not Featured</option>
          </select>

          {/* Visible Filter */}
          <select
            value={filters.visible}
            onChange={(e) =>
              setFilters({ ...filters, visible: e.target.value })
            }
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all">All (Visibility)</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>

          {/* Clear Filters */}
          {(searchQuery ||
            filters.category !== "all" ||
            filters.onSale !== "all" ||
            filters.featured !== "all" ||
            filters.visible !== "all") && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2.5 text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Clear filters"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Active filters chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.category !== "all" && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              Category: {filters.category}
              <button
                onClick={() => setFilters({ ...filters, category: "all" })}
                className="ml-2 hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.onSale !== "all" && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              {filters.onSale === "onSale" ? "On Sale" : "Not on Sale"}
              <button
                onClick={() => setFilters({ ...filters, onSale: "all" })}
                className="ml-2 hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.featured !== "all" && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              {filters.featured === "featured" ? "Featured" : "Not Featured"}
              <button
                onClick={() => setFilters({ ...filters, featured: "all" })}
                className="ml-2 hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.visible !== "all" && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              {filters.visible === "visible" ? "Visible" : "Hidden"}
              <button
                onClick={() => setFilters({ ...filters, visible: "all" })}
                className="ml-2 hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 hover:text-primary-900"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden border border-gray-100 hover:border-gray-200 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || "/placeholder-image.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Icons */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isAliExpress && (
                      <span
                        className="p-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-sm"
                        title="AliExpress"
                      >
                        <Globe className="h-3 w-3" />
                      </span>
                    )}
                    {product.isFeatured && (
                      <span
                        className="p-1 bg-yellow-500 text-white rounded-full shadow-sm"
                        title="Featured"
                      >
                        <Star className="h-3 w-3" />
                      </span>
                    )}
                    {product.isVisible ? (
                      <span
                        className="p-1 bg-green-500 text-white rounded-full shadow-sm"
                        title="Visible"
                      >
                        <Eye className="h-3 w-3" />
                      </span>
                    ) : (
                      <span
                        className="p-1 bg-gray-500 text-white rounded-full shadow-sm"
                        title="Hidden"
                      >
                        <EyeOff className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  {/* Sale Badge */}
                  {product.discountPrice > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        SALE
                      </span>
                    </div>
                  )}
                  {product.isOnSaleSection && (
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                        On Sale Section
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {product.brand}
                    </p>

                    {/* AliExpress Info */}
                    {product.isAliExpress && (
                      <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>10-20 days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>Phone confirm</span>
                        </div>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shipping & Stock */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        <span>{formatPrice(product.shippingFee || 0)}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{product.stock} units</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-primary-600 text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-card">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || Object.values(filters).some((v) => v !== "all")
                ? "Try adjusting your filters or search query"
                : "Get started by adding your first product"}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal - enhanced layout but all fields/handlers preserved */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Images & Video section - unchanged but better spacing */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images {!editingProduct && "*"}
                  </label>
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {imagePreviews.map((preview, index) => {
                        const isExisting =
                          editingProduct &&
                          editingProduct.images &&
                          index < editingProduct.images.length;
                        const isMarkedForRemoval =
                          isExisting &&
                          imagesToRemove.includes(
                            editingProduct.images[index].public_id,
                          );
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className={`h-24 w-full object-cover rounded-lg border ${
                                isMarkedForRemoval ? "opacity-50" : ""
                              }`}
                            />
                            {isMarkedForRemoval && (
                              <div className="absolute inset-0 flex items-center justify-center bg-red-500/70 rounded-lg">
                                <span className="text-white text-xs font-medium">
                                  To be removed
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Max 6 images, 10MB each
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Video (Optional)
                  </label>
                  {videoPreview ? (
                    <div className="relative group">
                      {videoFile?.type?.startsWith("video/") ? (
                        <video
                          src={videoPreview}
                          className="w-full h-48 object-cover rounded-lg"
                          controls
                        />
                      ) : (
                        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500">Video Preview</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1">Max 50MB</p>
                </div>
              </div>

              {/* Basic fields - grid layout preserved, enhanced spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Rich text description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ color: [] }, { background: [] }],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link", "clean"],
                    ],
                  }}
                  className="bg-white rounded-lg overflow-hidden"
                />
              </div>

              {/* Price, Discount, Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Price
                  </label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Fee (TND)
                  </label>
                  <input
                    type="number"
                    name="shippingFee"
                    value={formData.shippingFee}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Category & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="tag1, tag2, tag3"
                    className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {/* Color Variants (unchanged) */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-2">
                  Color Variants (Optional)
                </h3>
                {colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="mb-4 p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Color name (e.g., Red)"
                        value={color.name}
                        onChange={(e) =>
                          handleColorChange(idx, "name", e.target.value)
                        }
                        className="border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) =>
                            handleColorChange(idx, "hex", e.target.value)
                          }
                          className="w-10 h-10 p-1 border rounded"
                        />
                        <input
                          type="text"
                          value={color.hex}
                          onChange={(e) =>
                            handleColorChange(idx, "hex", e.target.value)
                          }
                          className="flex-1 border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm">
                        Images for this color
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleColorImages(idx, e)}
                        className="w-full border border-gray-200 p-2 rounded-lg text-sm"
                      />
                      {color.previews && color.previews.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {color.previews.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              className="w-16 h-16 object-cover rounded border"
                              alt="color preview"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeColor(idx)}
                      className="mt-2 text-red-600 text-sm hover:underline"
                    >
                      Remove Color
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  + Add Color
                </button>
              </div>

              {/* Checkboxes - enhanced styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* AliExpress */}
                  <div
                    className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                      formData.isAliExpress
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id="isAliExpress"
                      name="isAliExpress"
                      checked={formData.isAliExpress}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1 mt-1"
                    />
                    <label htmlFor="isAliExpress" className="text-gray-700">
                      <span className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-orange-500" />
                        AliExpress Product
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Mark this product as coming from AliExpress
                      </p>
                      {formData.isAliExpress && (
                        <div className="mt-2 space-y-1 text-xs text-orange-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>10-20 days delivery</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>Phone confirmation required</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Featured */}
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1"
                    />
                    <label htmlFor="isFeatured" className="text-gray-700">
                      <span className="font-medium">Featured Product</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Show this product on the homepage
                      </p>
                    </label>
                  </div>

                  {/* On Sale Section */}
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <input
                      type="checkbox"
                      id="isOnSaleSection"
                      name="isOnSaleSection"
                      checked={formData.isOnSaleSection}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500/20 focus:ring-offset-1"
                    />
                    <label htmlFor="isOnSaleSection" className="text-gray-700">
                      <span className="font-medium">
                        Show in On Sale section
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        Display this product on the homepage “On Sale” block
                        (only if discounted)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Visible in Store */}
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors h-fit">
                  <input
                    type="checkbox"
                    id="isVisible"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1"
                  />
                  <label htmlFor="isVisible" className="text-gray-700">
                    <span className="font-medium">Visible in Store</span>
                    <p className="text-sm text-gray-500 mt-1">
                      Show this product to customers
                    </p>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-button"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
