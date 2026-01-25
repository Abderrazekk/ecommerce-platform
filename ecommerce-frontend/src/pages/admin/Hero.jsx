import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  getAllHeroes,
  getHeroById,
  createHero,
  updateHero,
  deleteHero,
  setActiveHero,
  resetHeroForm,
} from "../../redux/slices/hero.slice";
import {
  ArrowLeft,
  Upload,
  X,
  Eye,
  Edit2,
  Trash2,
  Check,
  Image as ImageIcon,
  Layout,
  Type,
  Palette,
  Zap,
  Globe,
  PlayCircle,
  Grid,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import ColorPicker from "../../components/common/ColorPicker";

const Hero = () => {
  const dispatch = useDispatch();
  const { heroes, loading, heroDetail } = useSelector((state) => state.hero);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    season: "summer",
    isActive: false,
    layoutStyle: "auto",
    transitionEffect: "fade",
    transitionSpeed: 1000,
    autoRotate: true,
    rotationInterval: 5000,
  });

  const [images, setImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [overlayTexts, setOverlayTexts] = useState([]);
  const [overlayPositions, setOverlayPositions] = useState([]);
  const [overlayColors, setOverlayColors] = useState([]);
  const [textSizes, setTextSizes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [heroToDelete, setHeroToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [layoutPreview, setLayoutPreview] = useState("auto");
  const [validationError, setValidationError] = useState(null);

  const seasons = [
    { value: "spring", label: "Spring", color: "bg-green-100 text-green-800" },
    {
      value: "summer",
      label: "Summer",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "autumn",
      label: "Autumn",
      color: "bg-orange-100 text-orange-800",
    },
    { value: "winter", label: "Winter", color: "bg-blue-100 text-blue-800" },
    {
      value: "special",
      label: "Special",
      color: "bg-purple-100 text-purple-800",
    },
  ];

  const layoutOptions = [
    {
      value: "auto",
      label: "Auto (Based on Image Count)",
      icon: <Globe className="h-4 w-4" />,
      description: "System chooses the best layout automatically",
    },
    {
      value: "slideshow",
      label: "Slideshow (One at a time)",
      icon: <PlayCircle className="h-4 w-4" />,
      description: "Images appear one by one, rotating every 5 seconds",
    },
  ];

  const transitionEffects = [
    { value: "fade", label: "Fade", description: "Smooth fade between images" },
    {
      value: "slide",
      label: "Slide",
      description: "Slide images horizontally",
    },
    { value: "zoom", label: "Zoom", description: "Zoom in/out transition" },
    { value: "flip", label: "Flip", description: "3D flip effect" },
    { value: "cube", label: "Cube", description: "3D cube rotation" },
  ];

  const overlayPositionOptions = [
    { value: "top-left", label: "Top Left" },
    { value: "top-center", label: "Top Center" },
    { value: "top-right", label: "Top Right" },
    { value: "center-left", label: "Center Left" },
    { value: "center", label: "Center" },
    { value: "center-right", label: "Center Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-right", label: "Bottom Right" },
  ];

  const textSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  // Calculate total images properly
  const calculateTotalImages = () => {
    return previewImages.filter(
      (img) => !img.public_id || !imagesToDelete.includes(img.public_id),
    ).length;
  };

  // Use useMemo to calculate total images efficiently
  const totalImages = useMemo(
    () => calculateTotalImages(),
    [previewImages, imagesToDelete, images],
  );

  useEffect(() => {
    dispatch(getAllHeroes({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (heroDetail && editingId) {
      setFormData({
        title: heroDetail.title,
        subtitle: heroDetail.subtitle || "",
        season: heroDetail.season,
        isActive: heroDetail.isActive,
        layoutStyle: heroDetail.layoutStyle || "auto",
        transitionEffect: heroDetail.transitionEffect || "fade",
        transitionSpeed: heroDetail.transitionSpeed || 1000,
        autoRotate: heroDetail.autoRotate ?? true,
        rotationInterval: heroDetail.rotationInterval || 5000,
      });

      setPreviewImages(heroDetail.images || []);
      setOverlayTexts(
        heroDetail.images?.map((img) => img.overlayText || "") || [],
      );
      setOverlayPositions(
        heroDetail.images?.map((img) => img.overlayPosition || "bottom-left") ||
          [],
      );
      setOverlayColors(
        heroDetail.images?.map((img) => img.overlayColor || "#FFFFFF") || [],
      );
      setTextSizes(
        heroDetail.images?.map((img) => img.textSize || "medium") || [],
      );
      setImages([]);
      setImagesToDelete([]);
      setValidationError(null);
    }
  }, [heroDetail, editingId]);

  useEffect(() => {
    // Update layout preview based on selected layout
    if (formData.layoutStyle === "slideshow") {
      setLayoutPreview("slideshow");
    } else {
      setLayoutPreview("auto");
    }
  }, [formData.layoutStyle]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Clear any previous validation error
    setValidationError(null);

    // Check maximum images
    if (files.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    // Calculate current total images (using updated function)
    const currentTotalImages = calculateTotalImages();
    const futureTotalImages = currentTotalImages + files.length;

    // Check total images won't exceed maximum
    if (futureTotalImages > 6) {
      toast.error("Maximum 6 images allowed total");
      return;
    }

    // Check if individual files are valid
    const invalidFiles = [];
    const validFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} exceeds 5MB limit`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      invalidFiles.forEach((error) => toast.error(error));
    }

    // Process valid files
    if (validFiles.length > 0) {
      const newImages = [];
      const newPreviews = [];

      validFiles.forEach((file) => {
        newImages.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            id: Date.now() + Math.random(), // Unique ID for each image
            url: e.target.result,
            isNew: true,
          });
          if (newPreviews.length === validFiles.length) {
            setPreviewImages((prev) => [...prev, ...newPreviews]);
            // Initialize overlay data for new images
            setOverlayTexts((prev) => [
              ...prev,
              ...Array(validFiles.length).fill(""),
            ]);
            setOverlayPositions((prev) => [
              ...prev,
              ...Array(validFiles.length).fill("bottom-left"),
            ]);
            setOverlayColors((prev) => [
              ...prev,
              ...Array(validFiles.length).fill("#FFFFFF"),
            ]);
            setTextSizes((prev) => [
              ...prev,
              ...Array(validFiles.length).fill("medium"),
            ]);
          }
        };
        reader.readAsDataURL(file);
      });

      setImages((prev) => [...prev, ...newImages]);

      // Show success message for successful uploads
      if (validFiles.length > 0) {
        toast.success(
          `Successfully added ${validFiles.length} image${validFiles.length > 1 ? "s" : ""}`,
        );
      }
    }
  };

  const handleRemoveImage = (index, publicId) => {
    if (publicId) {
      // Existing image - mark for deletion
      setImagesToDelete((prev) => [...prev, publicId]);
    } else {
      // New image - remove from images array
      // Find the corresponding image in the images array
      const previewImage = previewImages[index];
      if (previewImage && previewImage.isNew) {
        // Find and remove the corresponding file from images array
        // We need to match by some identifier since we don't have direct reference
        setImages((prev) => {
          // Remove by index in the images array that corresponds to this preview image
          // Since we add images in the same order as previews, we can count new images before this index
          const newImagesBeforeIndex = previewImages
            .slice(0, index)
            .filter((img) => img.isNew).length;
          return prev.filter((_, i) => i !== newImagesBeforeIndex);
        });
      }
    }

    // Remove from all arrays
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setOverlayTexts((prev) => prev.filter((_, i) => i !== index));
    setOverlayPositions((prev) => prev.filter((_, i) => i !== index));
    setOverlayColors((prev) => prev.filter((_, i) => i !== index));
    setTextSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOverlayTextChange = (index, text) => {
    const newTexts = [...overlayTexts];
    newTexts[index] = text;
    setOverlayTexts(newTexts);
  };

  const handleOverlayPositionChange = (index, position) => {
    const newPositions = [...overlayPositions];
    newPositions[index] = position;
    setOverlayPositions(newPositions);
  };

  const handleOverlayColorChange = (index, color) => {
    const newColors = [...overlayColors];
    newColors[index] = color;
    setOverlayColors(newColors);
  };

  const handleTextSizeChange = (index, size) => {
    const newSizes = [...textSizes];
    newSizes[index] = size;
    setTextSizes(newSizes);
  };

  const handleEditHero = async (id) => {
    setEditingId(id);
    await dispatch(getHeroById(id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      season: "summer",
      isActive: false,
      layoutStyle: "auto",
      transitionEffect: "fade",
      transitionSpeed: 1000,
      autoRotate: true,
      rotationInterval: 5000,
    });
    setImages([]);
    setPreviewImages([]);
    setOverlayTexts([]);
    setOverlayPositions([]);
    setOverlayColors([]);
    setTextSizes([]);
    setImagesToDelete([]);
    setEditingId(null);
    setValidationError(null);
    dispatch(resetHeroForm());
    setActiveTab("content");
  };

  const validateForm = () => {
    // Clear previous validation error
    setValidationError(null);

    // Title validation
    if (!formData.title.trim()) {
      setValidationError("Title is required");
      toast.error("Title is required");
      return false;
    }

    // Season validation
    if (!formData.season) {
      setValidationError("Season is required");
      toast.error("Season is required");
      return false;
    }

    // Image count validation (only check when submitting)
    if (totalImages < 2) {
      setValidationError("At least 2 images are required");
      toast.error("At least 2 images are required");
      return false;
    }

    if (totalImages > 6) {
      setValidationError("Maximum 6 images allowed");
      toast.error("Maximum 6 images allowed");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("subtitle", formData.subtitle);
    formDataToSend.append("season", formData.season);
    formDataToSend.append("isActive", formData.isActive);
    formDataToSend.append("layoutStyle", formData.layoutStyle);
    formDataToSend.append("transitionEffect", formData.transitionEffect);
    formDataToSend.append(
      "transitionSpeed",
      formData.transitionSpeed.toString(),
    );
    formDataToSend.append("autoRotate", formData.autoRotate.toString());
    formDataToSend.append(
      "rotationInterval",
      formData.rotationInterval.toString(),
    );

    // Append overlay data
    overlayTexts.forEach((text) => {
      formDataToSend.append("overlayTexts", text);
    });
    overlayPositions.forEach((position) => {
      formDataToSend.append("overlayPositions", position);
    });
    overlayColors.forEach((color) => {
      formDataToSend.append("overlayColors", color);
    });
    textSizes.forEach((size) => {
      formDataToSend.append("textSizes", size);
    });

    // Important: Send imagesToDelete as a JSON string
    if (imagesToDelete.length > 0) {
      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
      console.log("Sending images to delete:", imagesToDelete);
    }

    // Append new images
    images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    try {
      if (editingId) {
        await dispatch(
          updateHero({ id: editingId, formData: formDataToSend }),
        ).unwrap();
        toast.success("Hero updated successfully");
      } else {
        await dispatch(createHero(formDataToSend)).unwrap();
        toast.success("Hero created successfully");
      }

      resetForm();
      // Refresh the heroes list
      dispatch(getAllHeroes({ page: 1, limit: 20 }));
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHero = async () => {
    if (!heroToDelete) return;

    try {
      await dispatch(deleteHero(heroToDelete)).unwrap();
      toast.success("Hero deleted successfully");
      // Refresh the heroes list
      dispatch(getAllHeroes({ page: 1, limit: 20 }));
    } catch (error) {
      toast.error(error.message || "Failed to delete hero");
    } finally {
      setShowConfirmModal(false);
      setHeroToDelete(null);
    }
  };

  const handleSetActive = async (id) => {
    try {
      await dispatch(setActiveHero(id)).unwrap();
      toast.success("Hero set as active");
      // Refresh the heroes list
      dispatch(getAllHeroes({ page: 1, limit: 20 }));
    } catch (error) {
      toast.error(error.message || "Failed to set active hero");
    }
  };

  const renderLayoutPreview = () => {
    if (totalImages === 0) {
      return (
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Add images to see layout preview</p>
        </div>
      );
    }

    // Render slideshow layout preview
    if (layoutPreview === "slideshow") {
      return (
        <div className="h-64 bg-gray-900 rounded-lg flex flex-col items-center justify-center p-4">
          <div className="w-16 h-16 mb-4 text-white">
            <PlayCircle className="w-full h-full" />
          </div>
          <div className="text-center text-white">
            <p className="font-medium mb-2">Slideshow Mode</p>
            <p className="text-xs text-gray-300 mb-3">
              {totalImages} image{totalImages !== 1 ? "s" : ""} will appear one
              by one
            </p>
            <div className="flex justify-center space-x-2 mb-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i === 0 ? "bg-white" : "bg-gray-600"}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Each image displays for {formData.rotationInterval / 1000 || 5}{" "}
              seconds, then transitions to next
            </p>
          </div>
        </div>
      );
    }

    // Render auto layout preview (show actual images in a grid)
    return (
      <div className="h-64 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Grid className="h-5 w-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Auto Layout Preview
          </span>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">
            Based on {totalImages} image{totalImages !== 1 ? "s" : ""}, system
            will automatically choose the best display method
          </p>
        </div>

        {/* Show a dynamic grid of uploaded images */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previewImages
            .slice(0, Math.min(totalImages, 6))
            .map((img, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={img.url || img.url}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                  Image {index + 1}
                </div>
                {overlayTexts[index] && (
                  <div className="absolute top-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded truncate">
                    {overlayTexts[index]}
                  </div>
                )}
              </div>
            ))}

          {/* Show placeholder for remaining slots if less than 6 images */}
          {Array.from({ length: Math.max(0, 6 - totalImages) }).map(
            (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="relative rounded-lg overflow-hidden border border-dashed border-gray-300 bg-gray-100 flex items-center justify-center h-20"
              >
                <span className="text-xs text-gray-500">Add more</span>
              </div>
            ),
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>
            The system will choose the optimal arrangement for {totalImages}{" "}
            image{totalImages !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    );
  };

  if (loading && !heroes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  // Helper for overlay position classes
  const overlayPositionClasses = {
    "top-left": "top-2 left-2 text-left",
    "top-center": "top-2 left-1/2 transform -translate-x-1/2 text-center",
    "top-right": "top-2 right-2 text-right",
    "center-left": "top-1/2 left-2 transform -translate-y-1/2 text-left",
    center:
      "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center",
    "center-right": "top-1/2 right-2 transform -translate-y-1/2 text-right",
    "bottom-left": "bottom-2 left-2 text-left",
    "bottom-center": "bottom-2 left-1/2 transform -translate-x-1/2 text-center",
    "bottom-right": "bottom-2 right-2 text-right",
  };

  // Helper for text size classes
  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Hero Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create dynamic hero sections with custom layouts, text overlays, and
            transitions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingId
                    ? `Edit Hero: ${heroDetail?.title}`
                    : "Create New Hero"}
                </h2>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Create
                  </button>
                )}
              </div>

              {/* Show validation error if exists */}
              {validationError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">{validationError}</p>
                  <p className="text-red-600 text-sm mt-1">
                    Please fix the error above before submitting the form.
                  </p>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "content" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setActiveTab("layout")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "layout" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <Layout className="h-4 w-4 inline mr-2" />
                    Layout & Style
                  </button>
                  <button
                    onClick={() => setActiveTab("overlays")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "overlays" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <Type className="h-4 w-4 inline mr-2" />
                    Text Overlays
                  </button>
                  <button
                    onClick={() => setActiveTab("transitions")}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "transitions" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Transitions
                  </button>
                </nav>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Content Tab */}
                {activeTab === "content" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter hero title"
                        maxLength={100}
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.title.length}/100 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtitle
                      </label>
                      <textarea
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter hero subtitle"
                        rows={3}
                        maxLength={200}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.subtitle.length}/200 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Season *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {seasons.map((season) => (
                          <button
                            key={season.value}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, season: season.value })
                            }
                            className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
                              formData.season === season.value
                                ? `${season.color} border-transparent ring-2 ring-offset-2 ring-primary-500`
                                : "border-gray-300 hover:border-primary-400"
                            }`}
                          >
                            {season.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images (2-6 required) *
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors duration-200">
                        <input
                          type="file"
                          id="hero-images"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="hero-images"
                          className={`cursor-pointer flex flex-col items-center ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <Upload className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            Click to upload images
                          </p>
                          <p className="text-sm text-gray-500">
                            Upload 2-6 images (JPG, PNG, GIF, WebP). Max 5MB
                            each.
                            <br />
                            <span className="text-primary-600 font-medium">
                              Currently have {totalImages} image
                              {totalImages !== 1 ? "s" : ""}
                            </span>
                          </p>
                        </label>
                      </div>

                      {/* Image Previews */}
                      {previewImages.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-sm font-medium text-gray-700 mb-3">
                            Images ({totalImages}/6)
                            {totalImages < 2 && (
                              <span className="ml-2 text-amber-600">
                                • Need {2 - totalImages} more
                              </span>
                            )}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {previewImages.map((img, index) => (
                              <div
                                key={img.id || img.public_id}
                                className="relative group rounded-lg overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={img.url || img.url}
                                  alt={`Preview ${index + 1}`}
                                  className="h-32 w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveImage(index, img.public_id)
                                  }
                                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {img.isNew && (
                                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                    New
                                  </span>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                                  Image {index + 1}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Image count status */}
                          <div className="mt-4 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                Total images: {totalImages}
                              </span>
                              <span
                                className={`font-medium ${
                                  totalImages >= 2 && totalImages <= 6
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {totalImages >= 2 && totalImages <= 6
                                  ? "✓ Ready to submit"
                                  : `Need ${totalImages < 2 ? 2 - totalImages + " more" : "to remove " + (totalImages - 6) + " images"}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                        disabled={isSubmitting}
                      />
                      <label htmlFor="isActive" className="ml-3 text-gray-700">
                        <span className="font-medium">Set as active hero</span>
                        <p className="text-sm text-gray-500">
                          Only one hero can be active at a time. Setting this
                          will deactivate any currently active hero.
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Layout Tab */}
                {activeTab === "layout" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layout Style
                      </label>
                      <p className="text-sm text-gray-500 mb-4">
                        Choose how your images will be displayed.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {layoutOptions.map((option) => {
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  layoutStyle: option.value,
                                })
                              }
                              className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                                formData.layoutStyle === option.value
                                  ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-offset-2"
                                  : "border-gray-300 hover:border-primary-400"
                              }`}
                            >
                              <div className="flex items-center mb-2">
                                <div
                                  className={`p-2 rounded-lg ${formData.layoutStyle === option.value ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"}`}
                                >
                                  {option.icon}
                                </div>
                                <div className="ml-3">
                                  <span className="font-medium block">
                                    {option.label}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                {option.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Layout Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layout Preview
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {formData.layoutStyle === "slideshow"
                                ? "Slideshow Layout"
                                : "Auto Layout"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {totalImages} image{totalImages !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        {renderLayoutPreview()}
                        <div className="mt-4 text-xs text-gray-500">
                          <p>
                            This is a preview of how your images will be
                            displayed based on the selected layout.
                          </p>
                          {overlayTexts.some((text) => text.trim() !== "") && (
                            <p className="mt-1">
                              Text overlays will be displayed on each image.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlays Tab */}
                {activeTab === "overlays" && (
                  <div className="space-y-6">
                    {previewImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Type className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p>Add images first to configure text overlays</p>
                      </div>
                    ) : (
                      previewImages.map((img, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                              <img
                                src={img.url || img.url}
                                alt={`Image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-medium">Image {index + 1}</h3>
                              <p className="text-sm text-gray-500">
                                Configure text overlay for this image
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Overlay Text */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Overlay Text
                              </label>
                              <textarea
                                value={overlayTexts[index] || ""}
                                onChange={(e) =>
                                  handleOverlayTextChange(index, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter text to display on this image"
                                rows={2}
                                maxLength={200}
                              />
                              <p className="mt-1 text-xs text-gray-500">
                                {overlayTexts[index]?.length || 0}/200
                                characters
                              </p>
                            </div>

                            {/* Text Position */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Text Position
                              </label>
                              <select
                                value={overlayPositions[index] || "bottom-left"}
                                onChange={(e) =>
                                  handleOverlayPositionChange(
                                    index,
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {overlayPositionOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Text Color */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Text Color
                              </label>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-300">
                                  <ColorPicker
                                    color={overlayColors[index] || "#FFFFFF"}
                                    onChange={(color) =>
                                      handleOverlayColorChange(index, color)
                                    }
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={overlayColors[index] || "#FFFFFF"}
                                  onChange={(e) =>
                                    handleOverlayColorChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                  placeholder="#FFFFFF"
                                />
                              </div>
                            </div>

                            {/* Text Size */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Text Size
                              </label>
                              <select
                                value={textSizes[index] || "medium"}
                                onChange={(e) =>
                                  handleTextSizeChange(index, e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              >
                                {textSizeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Preview of overlay on image */}
                          {overlayTexts[index] && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Preview:
                              </p>
                              <div className="relative h-20 w-full bg-gray-100 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
                                <div
                                  className={`absolute ${overlayPositionClasses[overlayPositions[index] || "bottom-left"]} p-2`}
                                  style={{
                                    color: overlayColors[index] || "#FFFFFF",
                                  }}
                                >
                                  <span
                                    className={`${textSizeClasses[textSizes[index] || "medium"]} font-semibold drop-shadow-md`}
                                  >
                                    {overlayTexts[index]}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Transitions Tab */}
                {activeTab === "transitions" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transition Effect
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {transitionEffects.map((effect) => (
                          <button
                            key={effect.value}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                transitionEffect: effect.value,
                              })
                            }
                            className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                              formData.transitionEffect === effect.value
                                ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-offset-2"
                                : "border-gray-300 hover:border-primary-400"
                            }`}
                          >
                            <span className="font-medium">{effect.label}</span>
                            <p className="text-xs text-gray-500 mt-1">
                              {effect.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Transition Speed */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transition Speed
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="500"
                            max="3000"
                            step="100"
                            value={formData.transitionSpeed}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                transitionSpeed: parseInt(e.target.value),
                              })
                            }
                            className="w-full"
                          />
                          <span className="text-sm font-medium whitespace-nowrap">
                            {formData.transitionSpeed}ms
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          How fast images transition (500ms - 3000ms)
                        </p>
                      </div>

                      {/* Auto Rotation */}
                      <div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="autoRotate"
                            name="autoRotate"
                            checked={formData.autoRotate}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <label
                            htmlFor="autoRotate"
                            className="ml-3 text-gray-700"
                          >
                            <span className="font-medium">
                              Auto Rotate Images
                            </span>
                            <p className="text-sm text-gray-500">
                              Automatically transition between images
                            </p>
                          </label>
                        </div>

                        {formData.autoRotate && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rotation Interval
                            </label>
                            <div className="flex items-center space-x-4">
                              <input
                                type="range"
                                min="2000"
                                max="10000"
                                step="500"
                                value={formData.rotationInterval}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    rotationInterval: parseInt(e.target.value),
                                  })
                                }
                                className="w-full"
                              />
                              <span className="text-sm font-medium whitespace-nowrap">
                                {formData.rotationInterval}ms
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              How long each image displays (2s - 10s)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transition Preview */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transition Preview
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-1/2 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg opacity-100 transition-opacity duration-1000"></div>
                          <div className="w-1/2 h-40 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg opacity-0 transition-opacity duration-1000 animation-delay-1000"></div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">
                            Previewing {formData.transitionEffect} transition
                            with {formData.transitionSpeed}ms duration
                          </p>
                          {formData.autoRotate && (
                            <p className="text-sm text-gray-600 mt-1">
                              Images will rotate every{" "}
                              {formData.rotationInterval}ms
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || totalImages < 2 || totalImages > 6
                    }
                    className={`px-6 py-3 ${
                      totalImages >= 2 && totalImages <= 6
                        ? "bg-primary-600 hover:bg-primary-700"
                        : "bg-gray-400 cursor-not-allowed"
                    } text-white rounded-lg transition-colors duration-200 font-medium`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader size="sm" className="mr-2" />
                        {editingId ? "Updating..." : "Creating..."}
                      </span>
                    ) : editingId ? (
                      "Update Hero"
                    ) : (
                      "Create Hero"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Hero List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">All Heroes</h2>
                <span className="text-sm text-gray-500">
                  {heroes.length} hero{heroes.length !== 1 ? "es" : ""}
                </span>
              </div>

              {heroes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p>No heroes created yet</p>
                  <p className="text-sm mt-2">Create your first hero above</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {heroes.map((hero) => (
                    <div
                      key={hero._id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        hero.isActive
                          ? "border-primary-500 bg-primary-50 ring-1 ring-primary-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {hero.title}
                          </h3>
                          {hero.subtitle && (
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {hero.subtitle}
                            </p>
                          )}
                          <div className="flex items-center mt-2 space-x-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                seasons.find((s) => s.value === hero.season)
                                  ?.color
                              }`}
                            >
                              {hero.season}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {hero.images?.length || 0} images
                            </span>
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {hero.layoutStyle === "auto"
                                ? "Auto"
                                : hero.layoutStyle}
                            </span>
                            {hero.isActive && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full flex items-center">
                                <Check className="h-3 w-3 mr-1" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!hero.isActive && (
                            <button
                              onClick={() => handleSetActive(hero._id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Set as active"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditHero(hero._id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setHeroToDelete(hero._id);
                              setShowConfirmModal(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Hero Images Preview */}
                      <div className="grid grid-cols-3 gap-2">
                        {hero.images?.slice(0, 3).map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded overflow-hidden relative"
                          >
                            <img
                              src={img.url}
                              alt={`${hero.title} ${idx + 1}`}
                              className="h-full w-full object-cover"
                            />
                            {img.overlayText && (
                              <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs p-1 rounded text-center truncate">
                                {img.overlayText}
                              </div>
                            )}
                          </div>
                        ))}
                        {hero.images?.length > 3 && (
                          <div className="aspect-square rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{hero.images.length - 3}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-500 flex justify-between">
                        <span>
                          Created:{" "}
                          {new Date(hero.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setHeroToDelete(null);
        }}
        onConfirm={handleDeleteHero}
        title="Delete Hero"
        message="Are you sure you want to delete this hero? This action cannot be undone. All images associated with this hero will be deleted from Cloudinary."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Hero;
