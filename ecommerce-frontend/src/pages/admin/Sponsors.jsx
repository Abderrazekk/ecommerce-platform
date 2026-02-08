// File: ecommerce-frontend/src/pages/admin/Sponsors.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  toggleSponsorVisibility,
  clearSponsorState,
  resetSuccess,
} from "../../redux/slices/sponsor.slice";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaPlus,
  FaLink,
} from "react-icons/fa";

const AdminSponsors = () => {
  const dispatch = useDispatch();
  const { adminSponsors, loading, error, success, message } = useSelector(
    (state) => state.sponsors,
  );

  const [showForm, setShowForm] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [previewImage, setPreviewImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    isVisible: true,
    order: 0,
    image: null,
  });

  useEffect(() => {
    dispatch(fetchAllSponsors());

    return () => {
      dispatch(clearSponsorState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success && message) {
      toast.success(message);
      dispatch(resetSuccess());
    }
    if (error) {
      toast.error(error);
    }
  }, [success, message, error, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name || "",
      website: sponsor.website || "",
      isVisible: sponsor.isVisible,
      order: sponsor.order || 0,
      image: null,
    });
    setPreviewImage(sponsor.image.url);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("website", formData.website);
    submitFormData.append("isVisible", formData.isVisible);
    submitFormData.append("order", formData.order);

    if (formData.image) {
      submitFormData.append("image", formData.image);
    }

    try {
      if (editingSponsor) {
        await dispatch(
          updateSponsor({ id: editingSponsor._id, formData: submitFormData }),
        ).unwrap();
        toast.success("Sponsor updated successfully");
      } else {
        await dispatch(createSponsor(submitFormData)).unwrap();
        toast.success("Sponsor created successfully");
      }

      resetForm();
      dispatch(fetchAllSponsors());
    } catch (error) {
      toast.error(error || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await dispatch(deleteSponsor(deleteModal.id)).unwrap();
      toast.success("Sponsor deleted successfully");
      setDeleteModal({ open: false, id: null });
      dispatch(fetchAllSponsors());
    } catch (error) {
      toast.error(error || "Failed to delete sponsor");
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      await dispatch(toggleSponsorVisibility(id)).unwrap();
      dispatch(fetchAllSponsors());
    } catch (error) {
      toast.error(error || "Failed to toggle visibility");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      website: "",
      isVisible: true,
      order: 0,
      image: null,
    });
    setPreviewImage(null);
    setEditingSponsor(null);
    setShowForm(false);
  };

  if (loading && !adminSponsors.length) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Sponsor Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage brand sponsors and their visibility
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <FaPlus />
          <span>{showForm ? "Cancel" : "Add New Sponsor"}</span>
        </button>
      </div>

      {/* Sponsor Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Samsung, Asus"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <FaLink />
                  </span>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Lower numbers appear first
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVisible"
                  name="isVisible"
                  checked={formData.isVisible}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isVisible"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Visible on website
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsor Logo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FaUpload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required={!editingSponsor}
                        />
                      </label>
                    </div>
                  </div>

                  {previewImage && (
                    <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-contain p-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData({ ...formData, image: null });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                {editingSponsor ? "Update Sponsor" : "Create Sponsor"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sponsors List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            All Sponsors ({adminSponsors.length})
          </h3>
        </div>

        {adminSponsors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No sponsors found. Add your first sponsor!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adminSponsors.map((sponsor) => (
                  <tr key={sponsor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2 flex items-center justify-center">
                        <img
                          src={sponsor.image.url}
                          alt={sponsor.name || "Sponsor"}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280'%3ELogo%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {sponsor.name || "Unnamed Sponsor"}
                        </div>
                        {sponsor.website && (
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-800 truncate block max-w-xs"
                          >
                            {sponsor.website}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleVisibility(sponsor._id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          sponsor.isVisible
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {sponsor.isVisible ? (
                          <>
                            <FaEye className="mr-1" />
                            Visible
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="mr-1" />
                            Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sponsor.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sponsor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(sponsor)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Edit"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ open: true, id: sponsor._id })
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Sponsor"
        message="Are you sure you want to delete this sponsor? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminSponsors;
