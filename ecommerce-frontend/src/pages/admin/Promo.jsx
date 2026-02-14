import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchActivePromo,
  createPromo,
  updatePromo,
  deletePromo,
  clearPromoError,
} from "../../redux/slices/promo.slice";
import Loader from "../../components/common/Loader";
import { toast } from "react-toastify"; // assuming toast is used

const AdminPromo = () => {
  const dispatch = useDispatch();
  const { activePromo, loading, error } = useSelector((state) => state.promo);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchActivePromo());
  }, [dispatch]);

  useEffect(() => {
    if (activePromo) {
      setImagePreview(activePromo.image);
      setIsVisible(activePromo.isVisible);
    } else {
      setImagePreview("");
      setIsVisible(false);
    }
  }, [activePromo]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearPromoError());
    }
  }, [error, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !activePromo) {
      toast.error("Please select an image");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    formData.append("isVisible", isVisible);

    try {
      if (activePromo) {
        // Update existing
        await dispatch(updatePromo({ id: activePromo._id, formData })).unwrap();
        toast.success("Promo updated successfully");
      } else {
        // Create new
        await dispatch(createPromo(formData)).unwrap();
        toast.success("Promo created successfully");
      }
      // Refresh
      dispatch(fetchActivePromo());
      setImageFile(null);
    } catch (err) {
      toast.error(err || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!activePromo) return;
    if (window.confirm("Are you sure you want to delete this promo?")) {
      try {
        await dispatch(deletePromo(activePromo._id)).unwrap();
        toast.success("Promo deleted");
        setImageFile(null);
        setImagePreview("");
        setIsVisible(false);
      } catch (err) {
        toast.error(err || "Delete failed");
      }
    }
  };

  if (loading && !activePromo) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Promo Banner</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* Image upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Banner Image
          </label>
          <div className="flex items-center space-x-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </div>

        {/* Visibility toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Set as active (visible on home page)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Only one promo can be active at a time. Enabling this will automatically disable any other active promo. image should be 1920x400 for best display results.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          {activePromo && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : activePromo ? "Update" : "Create"}
          </button>
        </div>
      </form>

      {activePromo && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Current Active Banner</h2>
          <img src={activePromo.image} alt="Active" className="max-w-xs rounded" />
        </div>
      )}
    </div>
  );
};

export default AdminPromo;