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
  const { products, loading } = useSelector((state) => state.products);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  // States
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
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [removeExistingVideo, setRemoveExistingVideo] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: Color variants state
  const [colors, setColors] = useState([]); // each: { name, hex, images: [] (existing URLs), files: [] (new files), previews: [] }

  useEffect(() => {
    dispatch(fetchAdminProducts({ page: 1, limit: 50 }));
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        (product.tags &&
          product.tags.some((tag) => tag.toLowerCase().includes(query)))
      );
    });
  }, [products, searchQuery]);

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
      });
      setImageFiles([]);
      setImagePreviews(
        product.images ? product.images.map((img) => img.url) : [],
      );
      setVideoFile(null);
      setVideoPreview(product.video || null);
      setRemoveExistingVideo(false);
      setImagesToRemove([]);

      // NEW: Load colors from product
      if (product.colors && product.colors.length > 0) {
        setColors(
          product.colors.map((c) => ({
            name: c.name,
            hex: c.hex,
            images: c.images || [], // existing image URLs
            files: [], // no new files initially
            previews: c.images || [], // use existing URLs as previews
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
      });
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
      setRemoveExistingVideo(false);
      setImagesToRemove([]);
      setColors([]); // reset colors
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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Calculate total images (existing previews + new files)
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

    // Add previews for new files
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
    // Check if this is an existing image (from product.images) or a new one
    const isExistingImage =
      editingProduct && index < (editingProduct.images?.length || 0);

    if (isExistingImage) {
      // For existing images, mark them for removal
      const imageId = editingProduct.images[index].public_id;
      setImagesToRemove((prev) => [...prev, imageId]);
    } else {
      // For new images, remove from imageFiles
      const adjustedIndex = index - (editingProduct?.images?.length || 0);
      setImageFiles((prev) => prev.filter((_, i) => i !== adjustedIndex));
    }

    // Remove from previews
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

  // NEW: Color handlers
  const handleColorChange = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const handleColorImages = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files (optional: add size/type checks)
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.error("Please select valid image files.");
      return;
    }

    const newColors = [...colors];
    // Store files for upload
    newColors[index].files = validFiles;
    // Create previews
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    newColors[index].previews = previews;
    setColors(newColors);
  };

  const addColor = () => {
    setColors([
      ...colors,
      {
        name: "",
        hex: "#000000",
        images: [], // existing URLs (empty for new)
        files: [],
        previews: [],
      },
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

    // Validate shipping fee
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

    // Validate colors: each must have name and hex
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

    // Shipping fee
    const shippingFeeNum = parseFloat(shippingFeeStr) || 0;
    productData.append("shippingFee", String(shippingFeeNum));

    productData.append("category", formData.category);
    productData.append("stock", formData.stock);
    productData.append("tags", formData.tags);
    productData.append("isFeatured", formData.isFeatured);
    productData.append("isVisible", formData.isVisible);
    productData.append("isAliExpress", formData.isAliExpress);

    // Add only NEW main images
    imageFiles.forEach((file) => {
      productData.append("images", file);
    });

    // Add images to remove if any
    imagesToRemove.forEach((publicId, idx) => {
      productData.append(`removeImages[${idx}]`, publicId);
    });

    // Video handling
    if (videoFile) productData.append("video", videoFile);
    if (editingProduct && removeExistingVideo && !videoFile)
      productData.append("removeVideo", "true");

    // NEW: Handle colors
    if (colors.length > 0) {
      // Prepare colors array without temporary fields
      const colorsData = colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        images: c.images || [], // include existing URLs (for updates)
      }));
      productData.append("colors", JSON.stringify(colorsData));

      // Append new images for each color with field name "colorImages[index]"
      colors.forEach((color, idx) => {
        if (color.files && color.files.length > 0) {
          color.files.forEach((file) => {
            productData.append(`colorImages[${idx}]`, file);
          });
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-gray-600">{filteredProducts.length} products</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
              product.isAliExpress ? "border-orange-300" : "border-gray-200"
            }`}
          >
            {/* Card content (unchanged) */}
            <div className="h-48 bg-gray-100 overflow-hidden relative">
              <img
                src={product.images?.[0]?.url || ""}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {product.isAliExpress && (
                <div className="absolute top-2 left-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full">
                    <Globe className="h-3 w-3" />
                    <span>AliExpress</span>
                  </div>
                </div>
              )}
              {product.isFeatured && (
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                    Featured
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    product.isAliExpress
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {product.category}
                </span>
              </div>

              {product.isAliExpress && (
                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">10-20 days delivery</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium">
                      Phone confirmation required
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <Truck className="h-4 w-4 mr-1" />
                  <span>Shipping: {formatPrice(product.shippingFee || 0)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full mr-2 ${
                      product.stock === 0
                        ? "bg-red-500"
                        : product.stock < 10
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  />
                  <span className="text-sm">{product.stock} units</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "Get started by adding your first product"}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Product Images (unchanged) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images {!editingProduct && "*"}
                    </label>
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
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
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className={`h-24 w-full object-cover rounded ${
                                  isMarkedForRemoval ? "opacity-50" : ""
                                }`}
                              />
                              {isMarkedForRemoval && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded">
                                  <span className="text-white text-xs font-bold">
                                    To be removed
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Max 6 images, 10MB each
                    </p>
                  </div>

                  {/* Product Video (unchanged) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Video (Optional)
                    </label>
                    {videoPreview ? (
                      <div className="mb-3">
                        <div className="relative">
                          {videoFile?.type?.startsWith("video/") ? (
                            <video
                              src={videoPreview}
                              className="w-full h-48 object-cover rounded"
                              controls
                            />
                          ) : (
                            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                              <span>Video Preview</span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="w-full border border-gray-300 rounded-lg p-2"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">Max 50MB</p>
                  </div>

                  {/* Basic fields grid (unchanged) */}
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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* NEW: Color Variants Section */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-2">
                      Color Variants (Optional)
                    </h3>
                    {colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="mb-4 p-4 border rounded bg-gray-50"
                      >
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Color name (e.g., Red)"
                            value={color.name}
                            onChange={(e) =>
                              handleColorChange(idx, "name", e.target.value)
                            }
                            className="border p-2 rounded"
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
                              className="flex-1 border p-2 rounded"
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
                            className="w-full border p-2 rounded"
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
                      className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                    >
                      + Add Color
                    </button>
                  </div>

                  {/* Checkboxes (unchanged) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div
                        className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                          formData.isAliExpress
                            ? "border-orange-300 bg-orange-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          id="isAliExpress"
                          name="isAliExpress"
                          checked={formData.isAliExpress}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-1 transition-all duration-200 mt-1"
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

                      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl">
                        <input
                          type="checkbox"
                          id="isFeatured"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1 transition-all duration-200"
                        />
                        <label htmlFor="isFeatured" className="text-gray-700">
                          <span className="font-medium">Featured Product</span>
                          <p className="text-sm text-gray-500 mt-1">
                            Show this product on the homepage
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl h-fit">
                      <input
                        type="checkbox"
                        id="isVisible"
                        name="isVisible"
                        checked={formData.isVisible}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-1 transition-all duration-200"
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
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
