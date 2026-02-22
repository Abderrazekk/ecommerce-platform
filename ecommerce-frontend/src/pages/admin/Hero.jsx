// Hero.jsx (Admin) – Full width version
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
  Sparkles,
  Layers,
  Settings,
  Film,
  Award,
  Clock,
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
    {
      value: "spring",
      label: "Spring",
      color: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      value: "summer",
      label: "Summer",
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      value: "autumn",
      label: "Autumn",
      color: "from-orange-400 to-red-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      value: "winter",
      label: "Winter",
      color: "from-blue-400 to-indigo-500",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      value: "special",
      label: "Special",
      color: "from-purple-400 to-pink-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  const layoutOptions = [
    {
      value: "auto",
      label: "Auto Layout",
      icon: <Globe className="h-5 w-5" />,
      description: "Intelligent arrangement based on image count",
      gradient: "from-primary-400 to-primary-600",
    },
    {
      value: "slideshow",
      label: "Slideshow",
      icon: <PlayCircle className="h-5 w-5" />,
      description: "Sequential image rotation with timing control",
      gradient: "from-blue-400 to-indigo-600",
    },
  ];

  const transitionEffects = [
    {
      value: "fade",
      label: "Fade",
      description: "Smooth crossfade between images",
      icon: "🌫️",
    },
    {
      value: "slide",
      label: "Slide",
      description: "Horizontal sliding transition",
      icon: "↔️",
    },
    {
      value: "zoom",
      label: "Zoom",
      description: "Depth zoom in/out effect",
      icon: "🔍",
    },
    {
      value: "flip",
      label: "Flip",
      description: "3D card flip animation",
      icon: "🔄",
    },
    {
      value: "cube",
      label: "Cube",
      description: "3D cube rotation effect",
      icon: "🎲",
    },
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

  const calculateTotalImages = () => {
    return previewImages.filter(
      (img) => !img.public_id || !imagesToDelete.includes(img.public_id),
    ).length;
  };

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

    setValidationError(null);

    if (files.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    const currentTotalImages = calculateTotalImages();
    const futureTotalImages = currentTotalImages + files.length;

    if (futureTotalImages > 6) {
      toast.error("Maximum 6 images allowed total");
      return;
    }

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

    if (invalidFiles.length > 0) {
      invalidFiles.forEach((error) => toast.error(error));
    }

    if (validFiles.length > 0) {
      const newImages = [];
      const newPreviews = [];

      validFiles.forEach((file) => {
        newImages.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            id: Date.now() + Math.random(),
            url: e.target.result,
            isNew: true,
          });
          if (newPreviews.length === validFiles.length) {
            setPreviewImages((prev) => [...prev, ...newPreviews]);
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

      if (validFiles.length > 0) {
        toast.success(
          `Successfully added ${validFiles.length} image${validFiles.length > 1 ? "s" : ""}`,
        );
      }
    }
  };

  const handleRemoveImage = (index, publicId) => {
    if (publicId) {
      setImagesToDelete((prev) => [...prev, publicId]);
    } else {
      const previewImage = previewImages[index];
      if (previewImage && previewImage.isNew) {
        const newImagesBeforeIndex = previewImages
          .slice(0, index)
          .filter((img) => img.isNew).length;
        setImages((prev) => prev.filter((_, i) => i !== newImagesBeforeIndex));
      }
    }

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
    setValidationError(null);

    if (!formData.title.trim()) {
      setValidationError("Title is required");
      toast.error("Title is required");
      return false;
    }

    if (!formData.season) {
      setValidationError("Season is required");
      toast.error("Season is required");
      return false;
    }

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

    if (imagesToDelete.length > 0) {
      formDataToSend.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

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
      dispatch(getAllHeroes({ page: 1, limit: 20 }));
    } catch (error) {
      toast.error(error.message || "Failed to set active hero");
    }
  };

  const renderLayoutPreview = () => {
    if (totalImages === 0) {
      return (
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Add images to see layout preview
            </p>
          </div>
        </div>
      );
    }

    if (layoutPreview === "slideshow") {
      return (
        <div className="h-64 bg-gradient-to-br from-gray-900 to-black rounded-2xl flex flex-col items-center justify-center p-6 border border-gray-800">
          <div className="relative mb-4">
            <div className="w-20 h-20 text-white bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <PlayCircle className="w-10 h-10" />
            </div>
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
              LIVE
            </div>
          </div>
          <div className="text-center text-white">
            <p className="font-bold text-lg mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Slideshow Mode
            </p>
            <p className="text-sm text-gray-300 mb-4">
              {totalImages} image{totalImages !== 1 ? "s" : ""} rotating every{" "}
              {formData.rotationInterval / 1000 || 5}s
            </p>
            <div className="flex justify-center space-x-3 mb-6">
              {previewImages.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${i === 0 ? "bg-white scale-110 shadow-glow" : "bg-gray-600"}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-center text-xs text-gray-400 space-x-4">
              <Clock className="w-4 h-4" />
              <span>Duration: {formData.transitionSpeed}ms</span>
              <Film className="w-4 h-4" />
              <span>{formData.transitionEffect}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-64 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-gradient-to-r from-primary-100 to-primary-50 rounded-xl mr-3">
            <Globe className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <span className="text-lg font-bold text-gray-800">
              Auto Layout Preview
            </span>
            <p className="text-sm text-gray-600">
              Smart arrangement based on content
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            System will intelligently arrange {totalImages} image
            {totalImages !== 1 ? "s" : ""} for optimal visual impact
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {previewImages
            .slice(0, Math.min(totalImages, 6))
            .map((img, index) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <img
                  src={img.url || img.url}
                  alt={`Preview ${index + 1}`}
                  className="h-20 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1.5 rounded-lg text-center backdrop-blur-sm">
                  Image {index + 1}
                </div>
                {overlayTexts[index] && (
                  <div className="absolute top-2 left-2 right-2 bg-black/60 text-white text-xs p-1.5 rounded-lg truncate backdrop-blur-sm">
                    {overlayTexts[index]}
                  </div>
                )}
              </div>
            ))}

          {Array.from({ length: Math.max(0, 6 - totalImages) }).map(
            (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center h-20 hover:border-primary-400 transition-colors duration-300"
              >
                <Sparkles className="w-5 h-5 text-gray-400" />
              </div>
            ),
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Intelligent layout optimization in real-time
          </p>
        </div>
      </div>
    );
  };

  if (loading && !heroes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Loader size="lg" className="mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading hero management...
          </p>
        </div>
      </div>
    );
  }

  const overlayPositionClasses = {
    "top-left": "top-4 left-4 text-left",
    "top-center": "top-4 left-1/2 transform -translate-x-1/2 text-center",
    "top-right": "top-4 right-4 text-right",
    "center-left": "top-1/2 left-4 transform -translate-y-1/2 text-left",
    center:
      "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center",
    "center-right": "top-1/2 right-4 transform -translate-y-1/2 text-right",
    "bottom-left": "bottom-4 left-4 text-left",
    "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2 text-center",
    "bottom-right": "bottom-4 right-4 text-right",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  const TabButton = ({ active, onClick, icon, label, count }) => (
    <button
      onClick={onClick}
      className={`relative px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
        active
          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200"
          : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {count !== undefined && (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            active ? "bg-white/20" : "bg-gray-100"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      {/* Full width container – no max-width constraint */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-100 to-primary-50 rounded-2xl mb-4">
            <Award className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 bg-clip-text text-transparent">
            Hero Management
          </h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Create stunning visual experiences with dynamic layouts, intelligent
            transitions, and custom text overlays
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary-100/20 border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId
                        ? `Editing: ${heroDetail?.title}`
                        : "Create New Hero"}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      {editingId
                        ? "Modify your hero configuration"
                        : "Design your perfect hero section"}
                    </p>
                  </div>
                  {editingId && (
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="font-medium">Cancel Edit</span>
                    </button>
                  )}
                </div>

                {validationError && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <X className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-red-800 font-semibold">
                          {validationError}
                        </p>
                        <p className="text-red-600 text-sm mt-1">
                          Please address this issue before proceeding
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Tabs */}
              <div className="px-8 pt-6">
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  <TabButton
                    active={activeTab === "content"}
                    onClick={() => setActiveTab("content")}
                    icon={<Sparkles className="h-5 w-5" />}
                    label="Content"
                  />
                  <TabButton
                    active={activeTab === "layout"}
                    onClick={() => setActiveTab("layout")}
                    icon={<Layout className="h-5 w-5" />}
                    label="Layout"
                  />
                  <TabButton
                    active={activeTab === "overlays"}
                    onClick={() => setActiveTab("overlays")}
                    icon={<Type className="h-5 w-5" />}
                    label="Overlays"
                    count={overlayTexts.filter((t) => t.trim()).length}
                  />
                  <TabButton
                    active={activeTab === "transitions"}
                    onClick={() => setActiveTab("transitions")}
                    icon={<Zap className="h-5 w-5" />}
                    label="Transitions"
                  />
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Content Tab */}
                {activeTab === "content" && (
                  <div className="space-y-8">
                    {/* Title & Subtitle Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          <span className="flex items-center">
                            <Sparkles className="h-4 w-4 mr-2 text-primary-500" />
                            Title *
                          </span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white"
                          placeholder="Enter captivating title"
                          maxLength={100}
                          required
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Be creative and engaging
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              formData.title.length > 90
                                ? "text-amber-600"
                                : "text-gray-500"
                            }`}
                          >
                            {formData.title.length}/100
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Subtitle (Optional)
                        </label>
                        <textarea
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white"
                          placeholder="Add supporting subtitle"
                          rows={2}
                          maxLength={200}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">
                            Supporting text for your hero
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {formData.subtitle.length}/200
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Season Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-4">
                        <span className="flex items-center">
                          <Palette className="h-4 w-4 mr-2 text-primary-500" />
                          Season Theme *
                        </span>
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {seasons.map((season) => (
                          <button
                            key={season.value}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, season: season.value })
                            }
                            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                              formData.season === season.value
                                ? `${season.bg} ${season.border} border-opacity-100 scale-[1.02] shadow-lg`
                                : "border-gray-200 hover:border-primary-300"
                            }`}
                          >
                            <div className="text-center">
                              <div
                                className={`h-8 w-8 mx-auto rounded-lg mb-2 bg-gradient-to-br ${season.color}`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  formData.season === season.value
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {season.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-4">
                        <span className="flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2 text-primary-500" />
                          Visual Content (2-6 images required) *
                        </span>
                      </label>
                      <div className="relative">
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
                          className={`block cursor-pointer rounded-2xl border-3 border-dashed p-8 text-center transition-all duration-300 hover:border-primary-400 hover:shadow-xl ${
                            isSubmitting
                              ? "opacity-50 cursor-not-allowed border-gray-300"
                              : "border-gray-200 bg-gradient-to-b from-gray-50 to-white"
                          }`}
                        >
                          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-primary-100 to-primary-50 rounded-2xl mb-4">
                            <Upload className="h-8 w-8 text-primary-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Drop your images here
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Upload 2-6 high-quality images (JPG, PNG, GIF, WebP)
                          </p>
                          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
                            <Upload className="h-4 w-4" />
                            <span>Browse Files</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-4">
                            Max 5MB per image • Current: {totalImages}/6 images
                          </p>
                        </label>
                      </div>

                      {/* Image Previews */}
                      {previewImages.length > 0 && (
                        <div className="mt-8">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">
                              Image Gallery ({totalImages}/6)
                            </h3>
                            <div
                              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                totalImages >= 2 && totalImages <= 6
                                  ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200"
                                  : "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {totalImages >= 2 && totalImages <= 6
                                ? "✓ Ready to use"
                                : totalImages < 2
                                  ? `Need ${2 - totalImages} more images`
                                  : `Remove ${totalImages - 6} images`}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {previewImages.map((img, index) => (
                              <div
                                key={img.id || img.public_id}
                                className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-all duration-300"
                              >
                                <div className="aspect-square overflow-hidden">
                                  <img
                                    src={img.url || img.url}
                                    alt={`Preview ${index + 1}`}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveImage(index, img.public_id)
                                  }
                                  className="absolute top-3 right-3 p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-lg"
                                  disabled={isSubmitting}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {img.isNew && (
                                  <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-lg">
                                    NEW
                                  </span>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                  <span className="text-white text-sm font-medium">
                                    Image {index + 1}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl border border-primary-100">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="sr-only"
                          disabled={isSubmitting}
                        />
                        <label
                          htmlFor="isActive"
                          className={`flex items-center cursor-pointer ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <div
                            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                              formData.isActive
                                ? "bg-gradient-to-r from-primary-500 to-primary-600"
                                : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full transform transition-all duration-300 ${
                                formData.isActive ? "translate-x-6" : ""
                              }`}
                            />
                          </div>
                          <div className="ml-4">
                            <span className="font-bold text-gray-900">
                              Set as Active Hero
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              Only one hero can be active at a time. Activating
                              this will automatically deactivate others.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Layout Tab */}
                {activeTab === "layout" && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-6">
                        <span className="flex items-center">
                          <Layout className="h-5 w-5 mr-2 text-primary-500" />
                          Layout Configuration
                        </span>
                        <p className="text-gray-600 text-sm font-normal mt-2">
                          Choose how your hero content will be presented to
                          visitors
                        </p>
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {layoutOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                layoutStyle: option.value,
                              })
                            }
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                              formData.layoutStyle === option.value
                                ? "border-primary-500 bg-gradient-to-br from-primary-50 to-white ring-2 ring-primary-200 ring-offset-2"
                                : "border-gray-200 hover:border-primary-300 bg-white"
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div
                                className={`p-3 rounded-xl bg-gradient-to-br ${option.gradient}`}
                              >
                                {option.icon}
                              </div>
                              <div className="text-left">
                                <h3 className="font-bold text-gray-900 mb-1">
                                  {option.label}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {option.description}
                                </p>
                              </div>
                            </div>
                            {formData.layoutStyle === option.value && (
                              <div className="mt-4 p-3 bg-primary-100 rounded-lg">
                                <p className="text-sm text-primary-700 font-medium">
                                  ✓ Currently selected
                                </p>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout Preview */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-6">
                        <span className="flex items-center">
                          <Eye className="h-5 w-5 mr-2 text-primary-500" />
                          Live Preview
                        </span>
                      </label>
                      {renderLayoutPreview()}
                    </div>
                  </div>
                )}

                {/* Overlays Tab */}
                {activeTab === "overlays" && (
                  <div className="space-y-8">
                    {previewImages.length === 0 ? (
                      <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300">
                        <Type className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          No Images Added Yet
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Upload images first to configure custom text overlays
                          and enhance visual storytelling
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {previewImages.map((img, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
                          >
                            <div className="flex items-start space-x-6 mb-6">
                              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                                <img
                                  src={img.url || img.url}
                                  alt={`Image ${index + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    Image {index + 1} Overlay
                                  </h3>
                                  <span className="px-3 py-1 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-sm font-semibold rounded-full">
                                    Configurable
                                  </span>
                                </div>
                                <p className="text-gray-600">
                                  Customize text appearance for this specific
                                  image
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Overlay Text */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                  Overlay Text
                                </label>
                                <textarea
                                  value={overlayTexts[index] || ""}
                                  onChange={(e) =>
                                    handleOverlayTextChange(
                                      index,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white"
                                  placeholder="Enter compelling text for this image..."
                                  rows={3}
                                  maxLength={200}
                                />
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-500">
                                    Engaging text that complements the image
                                  </span>
                                  <span className="text-xs text-gray-500 font-medium">
                                    {overlayTexts[index]?.length || 0}/200
                                  </span>
                                </div>
                              </div>

                              {/* Text Position & Size */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Position
                                  </label>
                                  <select
                                    value={
                                      overlayPositions[index] || "bottom-left"
                                    }
                                    onChange={(e) =>
                                      handleOverlayPositionChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white appearance-none"
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

                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                                    Text Size
                                  </label>
                                  <select
                                    value={textSizes[index] || "medium"}
                                    onChange={(e) =>
                                      handleTextSizeChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white appearance-none"
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

                              {/* Text Color */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                  Text Color
                                </label>
                                <div className="flex items-center space-x-4">
                                  <div className="relative">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
                                      <ColorPicker
                                        color={
                                          overlayColors[index] || "#FFFFFF"
                                        }
                                        onChange={(color) =>
                                          handleOverlayColorChange(index, color)
                                        }
                                      />
                                    </div>
                                    <div
                                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg"
                                      style={{
                                        backgroundColor:
                                          overlayColors[index] || "#FFFFFF",
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={overlayColors[index] || "#FFFFFF"}
                                      onChange={(e) =>
                                        handleOverlayColorChange(
                                          index,
                                          e.target.value,
                                        )
                                      }
                                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white font-mono"
                                      placeholder="#FFFFFF"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Preview */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                  Live Preview
                                </label>
                                <div className="relative h-32 w-full rounded-xl overflow-hidden border-2 border-gray-200">
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600"></div>
                                  {overlayTexts[index] && (
                                    <div
                                      className={`absolute ${overlayPositionClasses[overlayPositions[index] || "bottom-left"]} px-4 py-3 rounded-xl backdrop-blur-sm bg-black/30`}
                                      style={{
                                        color:
                                          overlayColors[index] || "#FFFFFF",
                                      }}
                                    >
                                      <span
                                        className={`${textSizeClasses[textSizes[index] || "medium"]} font-bold drop-shadow-lg`}
                                      >
                                        {overlayTexts[index]}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Transitions Tab */}
                {activeTab === "transitions" && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-6">
                        <span className="flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-primary-500" />
                          Animation & Transitions
                        </span>
                        <p className="text-gray-600 text-sm font-normal mt-2">
                          Configure smooth transitions between images for
                          enhanced user experience
                        </p>
                      </label>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                              formData.transitionEffect === effect.value
                                ? "border-primary-500 bg-gradient-to-br from-primary-50 to-white ring-2 ring-primary-200"
                                : "border-gray-200 hover:border-primary-300 bg-white"
                            }`}
                          >
                            <div className="text-2xl mb-2">{effect.icon}</div>
                            <div>
                              <span className="font-semibold text-gray-900 block">
                                {effect.label}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                {effect.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Transition Speed */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-6">
                          <span className="flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-primary-500" />
                            Transition Speed
                          </span>
                        </label>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">
                              Duration
                            </span>
                            <span className="text-lg font-bold text-primary-600">
                              {formData.transitionSpeed}ms
                            </span>
                          </div>
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
                            className="w-full h-2 bg-gradient-to-r from-gray-200 to-primary-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary-500 [&::-webkit-slider-thumb]:to-primary-600 [&::-webkit-slider-thumb]:shadow-lg"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Fast (500ms)</span>
                            <span>Medium (1500ms)</span>
                            <span>Smooth (3000ms)</span>
                          </div>
                        </div>
                      </div>

                      {/* Auto Rotation */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <label className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                formData.autoRotate
                                  ? "bg-gradient-to-r from-primary-100 to-primary-50"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Clock className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 block">
                                Auto Rotation
                              </span>
                              <p className="text-sm text-gray-600">
                                Automatically cycle through images
                              </p>
                            </div>
                          </label>
                          <input
                            type="checkbox"
                            id="autoRotate"
                            name="autoRotate"
                            checked={formData.autoRotate}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="autoRotate"
                            className="cursor-pointer"
                          >
                            <div
                              className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
                                formData.autoRotate
                                  ? "bg-gradient-to-r from-primary-500 to-primary-600"
                                  : "bg-gray-300"
                              }`}
                            >
                              <div
                                className={`bg-white w-6 h-6 rounded-full transform transition-all duration-300 ${
                                  formData.autoRotate ? "translate-x-6" : ""
                                }`}
                              />
                            </div>
                          </label>
                        </div>

                        {formData.autoRotate && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-700">
                                Rotation Interval
                              </span>
                              <span className="text-lg font-bold text-primary-600">
                                {formData.rotationInterval / 1000}s
                              </span>
                            </div>
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
                              className="w-full h-2 bg-gradient-to-r from-gray-200 to-blue-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-blue-600 [&::-webkit-slider-thumb]:shadow-lg"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Quick (2s)</span>
                              <span>Standard (5s)</span>
                              <span>Relaxed (10s)</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transition Preview */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-6">
                        <span className="flex items-center">
                          <Film className="h-5 w-5 mr-2 text-primary-500" />
                          Transition Preview
                        </span>
                      </label>
                      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 p-8">
                        <div className="flex items-center justify-center space-x-8">
                          <div className="relative">
                            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse shadow-xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                Current
                              </span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center animate-bounce">
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm text-gray-400">
                              {formData.transitionEffect}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 shadow-xl opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white font-bold text-lg opacity-50">
                                Next
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-8 text-center">
                          <p className="text-white text-lg font-bold mb-2">
                            Previewing {formData.transitionEffect} Transition
                          </p>
                          <p className="text-gray-400">
                            Duration: {formData.transitionSpeed}ms •{" "}
                            {formData.autoRotate
                              ? `Rotation every ${formData.rotationInterval / 1000}s`
                              : "Manual rotation"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                      disabled={isSubmitting}
                    >
                      Discard Changes
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || totalImages < 2 || totalImages > 6
                    }
                    className={`px-10 py-3.5 rounded-xl transition-all duration-300 font-bold ${
                      totalImages >= 2 && totalImages <= 6
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 hover:shadow-xl hover:scale-[1.02] text-white shadow-lg shadow-primary-200"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader size="sm" className="mr-3" />
                        {editingId ? "Updating Hero..." : "Creating Hero..."}
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

          {/* Enhanced Right Column - Hero List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl shadow-primary-100/20 border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Hero Library
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 text-sm font-bold rounded-full">
                      {heroes.length} {heroes.length === 1 ? "Hero" : "Heroes"}
                    </span>
                    {heroes.filter((h) => h.isActive).length > 0 && (
                      <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-sm font-bold rounded-full">
                        {heroes.filter((h) => h.isActive).length} Active
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">
                  Manage all your hero sections in one place
                </p>
              </div>

              {heroes.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl mb-6">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    No Heroes Created Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first hero section above
                  </p>
                  <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold">
                    <Sparkles className="h-4 w-4" />
                    <span>Create Your First Hero</span>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {heroes.map((hero) => (
                      <div
                        key={hero._id}
                        className={`group rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${
                          hero.isActive
                            ? "border-primary-500 bg-gradient-to-br from-primary-50 to-white"
                            : "border-gray-200 hover:border-primary-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white"
                        }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 pr-4">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="font-bold text-gray-900 truncate text-lg">
                                  {hero.title}
                                </h3>
                                {hero.isActive && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold rounded-full flex items-center shadow-lg">
                                    <Check className="h-3 w-3 mr-1" />
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              {hero.subtitle && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {hero.subtitle}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                                    seasons.find((s) => s.value === hero.season)
                                      ?.bg || "bg-gray-100"
                                  } ${
                                    seasons.find((s) => s.value === hero.season)
                                      ?.border || "border-gray-200"
                                  } border`}
                                >
                                  {hero.season}
                                </span>
                                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                                  {hero.images?.length || 0} images
                                </span>
                                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                                  {hero.layoutStyle === "auto"
                                    ? "Auto Layout"
                                    : "Slideshow"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {!hero.isActive && (
                                <button
                                  onClick={() => handleSetActive(hero._id)}
                                  className="p-2.5 text-green-600 hover:text-green-700 hover:bg-gradient-to-br from-green-50 to-green-100 rounded-xl transition-all duration-300 transform hover:scale-110"
                                  title="Set as active"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditHero(hero._id)}
                                className="p-2.5 text-blue-600 hover:text-blue-700 hover:bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setHeroToDelete(hero._id);
                                  setShowConfirmModal(true);
                                }}
                                className="p-2.5 text-red-600 hover:text-red-700 hover:bg-gradient-to-br from-red-50 to-red-100 rounded-xl transition-all duration-300 transform hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Hero Images Preview */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            {hero.images?.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                className="aspect-square rounded-xl overflow-hidden relative group/img"
                              >
                                <img
                                  src={img.url}
                                  alt={`${hero.title} ${idx + 1}`}
                                  className="h-full w-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                                {img.overlayText && (
                                  <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs p-1.5 rounded-lg text-center truncate backdrop-blur-sm">
                                    {img.overlayText}
                                  </div>
                                )}
                              </div>
                            ))}
                            {hero.images?.length > 3 && (
                              <div className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-gray-700">
                                    +{hero.images.length - 3}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    more
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              Created{" "}
                              {new Date(hero.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs font-medium text-primary-600">
                              Click to preview
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setHeroToDelete(null);
        }}
        onConfirm={handleDeleteHero}
        title="Delete Hero Section"
        message="This action will permanently delete the hero section and all associated images from Cloudinary. This cannot be undone."
        confirmText="Delete Permanently"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Hero;
