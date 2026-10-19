
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Plus,  Search,  Pencil,  Trash2,
  X,  Utensils, Image as ImageIcon,  Loader2,  AlertCircle,  CheckCircle,  RefreshCw, } from "lucide-react";

  
const API_URL = "/api/admin/tiffins/";
const MEDIA_URL = "http://127.0.0.1:8000";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: "Veg Thali",
  is_available: true,
};

function getAuthHeaders() {
  const token = localStorage.getItem("admin-token");

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

function cleanImageUrl(value) {
  if (!value || typeof value !== "string") return "";

  const text = value.trim();

  const markdownMatch = text.match(
    /^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/
  );

  if (markdownMatch) return markdownMatch[1].trim();

  if (text.startsWith("[") && text.endsWith("]")) {
    return text.slice(1, -1).trim();
  }

  return text;
}

function getImageUrl(value) {
  const image = cleanImageUrl(value);

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `${MEDIA_URL}${image.startsWith("/") ? "" : "/"}${image}`;
}

function getTiffinImage(item) {
  return getImageUrl(item?.image || item?.image_url || "");
}

function getTiffinList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.tiffins)) return data.tiffins;
  return [];
}

function getErrorMessage(err, fallback) {
  const status = err.response?.status;
  const data = err.response?.data;

  if (!localStorage.getItem("admin-token")) {
    return "Admin token सापडला नाही. कृपया Admin Login करा.";
  }

  if (status === 401) {
    return "Login session invalid आहे. कृपया पुन्हा Admin Login करा.";
  }

  if (status === 403) {
    return data?.detail || "Admin permission नाही.";
  }

  if (status === 404) {
    return "API URL सापडला नाही. Django urls.py तपासा.";
  }

  if (status === 400 && data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
          ? value
            : JSON.stringify(value);

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  if (!err.response) {
    return "Django backend चालू आहे का ते तपासा.";
  }

  return data?.detail || data?.message || fallback;
}

export default function AdminTiffans() {
  const [tiffins, setTiffins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTiffins = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeaders(),
      });

      setTiffins(getTiffinList(response.data));
    } catch (err) {
      console.error("Fetch tiffins error:", err.response?.data || err.message);
      setTiffins([]);
      setError(getErrorMessage(err, "Tiffins load झाले नाहीत."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTiffins();
  }, [fetchTiffins]);

  const clearPreview = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const resetForm = () => {
    clearPreview();
    setForm({ ...emptyForm });
    setImage(null);
    setImageUrl("");
    setImagePreview("");
    setEditingId(null);
  };

  const openAddForm = () => {
    resetForm();
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
    setError("");
  };

  const openEditForm = (item) => {
    resetForm();

    setEditingId(item.id);

    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      category: item.category || "Veg Thali",
      is_available: item.is_available ?? true,
    });

    const existingImage = cleanImageUrl(
      item.image_url || item.image || ""
    );

    setImage(null);
    setImageUrl(existingImage);
    setImagePreview(getImageUrl(existingImage));

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("कृपया योग्य image file निवडा.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size 5 MB पेक्षा कमी असावी.");
      event.target.value = "";
      return;
    }

    clearPreview();

    setError("");
    setImage(file);
    setImageUrl("");
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUrlChange = (event) => {
    const value = cleanImageUrl(event.target.value);

    clearPreview();

    setImageUrl(value);
    setImage(null);
    setImagePreview(getImageUrl(value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Tiffin name आवश्यक आहे.");
      return;
    }

    if (!form.description.trim()) {
      setError("Tiffin description आवश्यक आहे.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError("कृपया योग्य price भरा.");
      return;
    }

    const normalizedUrl = cleanImageUrl(imageUrl);

    if (!image && normalizedUrl) {
      try {
        const parsedUrl = new URL(normalizedUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          setError("कृपया योग्य image URL भरा.");
          return;
        }
      } catch {
        setError("कृपया योग्य image URL भरा.");
        return;
      }
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = new FormData();

      payload.append("name", form.name.trim());
      payload.append("description", form.description.trim());
      payload.append("price", String(form.price));
      payload.append("category", form.category);
      payload.append("is_available", String(form.is_available));

      if (image) {
        payload.append("image", image);
        payload.append("image_url", "");
      } else if (normalizedUrl) {
        payload.append("image_url", normalizedUrl);
      } else if (editingId === null) {
        payload.append("image_url", "");
      }

      const config = {
        headers: getAuthHeaders(),
      };

      if (editingId !== null) {
        await axios.patch(`${API_URL}${editingId}/`, payload, config);
        setMessage("Tiffin successfully update झाला.");
      } else {
        await axios.post(API_URL, payload, config);
        setMessage("Tiffin successfully add झाला.");
      }

      setShowForm(false);
      resetForm();

      await fetchTiffins();
    } catch (err) {
      console.error("Save tiffin error:", err.response?.data || err.message);
      setError(getErrorMessage(err, "Tiffin save करताना error आला."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `"${item.name}" delete करायचा आहे का?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setMessage("");

    try {
      await axios.delete(`${API_URL}${item.id}/`, {
        headers: getAuthHeaders(),
      });

      setTiffins((previous) =>
        previous.filter((tiffin) => tiffin.id !== item.id)
      );

      setMessage("Tiffin delete झाला.");
    } catch (err) {
      console.error("Delete tiffin error:", err.response?.data || err.message);
      setError(getErrorMessage(err, "Tiffin delete करताना error आला."));
    } finally {
      setDeletingId(null);
    }
  };

  const searchText = search.trim().toLowerCase();

  const filteredTiffins = tiffins.filter((item) =>
    [item.name, item.category, item.description].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Tiffin Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Add, edit आणि manage your tiffins
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            <Plus size={20} />
            Add Tiffin
          </button>
        </div>

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle size={20} />
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="ml-auto"
              aria-label="Dismiss message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {error && !showForm && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto"
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-md flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input type="search"  value={search}  onChange={(event) => setSearch(event.target.value)} placeholder="Search tiffins..."  aria-label="Search tiffins"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button  type="button"  onClick={fetchTiffins} disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
              <Loader2 size={24} className="animate-spin" />
              <span>Tiffins loading...</span>
            </div>
          ) : error && tiffins.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <AlertCircle size={42} className="mb-3 text-red-400" />
              <p className="font-semibold text-gray-800">Tiffins load झाले नाहीत.</p>
              <button
                type="button"
                onClick={fetchTiffins}
                className="mt-4 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredTiffins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Utensils size={48} className="mb-3 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700">
                Tiffins सापडले नाहीत
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                नवीन tiffin add करा किंवा search बदला.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">Tiffin</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">Category</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">Price</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase text-gray-500">Availability</th>
                    <th className="px-5 py-4 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredTiffins.map((item) => {
                    const tiffinImage = getTiffinImage(item);

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {tiffinImage ? (
                              <img
                                src={tiffinImage}
                                alt={item.name || "Tiffin"}
                                className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-400">
                                <ImageIcon size={24} />
                              </div>
                            )}

                            <div className="max-w-xs">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                {item.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700">
                            {item.category || "Uncategorized"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">
                          {item.is_available ? (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              Available
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Unavailable
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => openEditForm(item)} title="Edit Tiffin" aria-label={`Edit ${item.name}`}
                              className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"  >
                              <Pencil size={18} />
                            </button>

                            <button type="button" onClick={() => handleDelete(item)}   disabled={deletingId === item.id}  title="Delete Tiffin" aria-label={`Delete ${item.name}`}
                              className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" >
                              {deletingId === item.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredTiffins.length} of {tiffins.length} tiffins
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId !== null ? "Edit Tiffin" : "Add New Tiffin"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">Tiffin details भरा</p>
                </div>

                <button  type="button"
                  onClick={closeForm} disabled={saving}  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Close form"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    >
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="tiffin-name" className="mb-2 block text-sm font-semibold text-gray-700">
                      Tiffin Name *
                    </label>
                    <input  id="tiffin-name" type="text" name="name"  value={form.name}  onChange={handleChange} required placeholder="Special Veg Thali"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="tiffin-description" className="mb-2 block text-sm font-semibold text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="tiffin-description" name="description" value={form.description} onChange={handleChange}  required  rows={3}  placeholder="Tiffin मध्ये काय काय आहे ते लिहा"
                      className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="tiffin-price" className="mb-2 block text-sm font-semibold text-gray-700">
                        Price (₹) *
                      </label>
                      <input id="tiffin-price" type="number" name="price" value={form.price}
                        onChange={handleChange} required min="0" step="0.01" placeholder="120"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="tiffin-category" className="mb-2 block text-sm font-semibold text-gray-700">
                        Category *
                      </label>
                      <select  id="tiffin-category"  name="category"
                        value={form.category} onChange={handleChange} required
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="Veg Thali">Veg Thali</option>
                        <option value="Special Thali">Special Thali</option>
                        <option value="Non Veg Thali">Non Veg Thali</option>
                        <option value="Mini Thali">Mini Thali</option>
                        <option value="Combo">Combo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="tiffin-image-url" className="mb-2 block text-sm font-semibold text-gray-700">
                      Image URL
                    </label>
                    <input  id="tiffin-image-url"  type="url"  value={imageUrl} onChange={handleImageUrlChange} placeholder="https://example.com/veg-thali.jpg"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Direct image URL paste करा किंवा खाली image upload करा.
                    </p>
                  </div>

                  {/* <div>
                    <label htmlFor="tiffin-image" className="mb-2 block text-sm font-semibold text-gray-700">
                      Image Upload
                    </label>
                    <input  id="tiffin-image" type="file"  accept="image/*" onChange={handleImageChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-orange-700 hover:file:bg-orange-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG किंवा WEBP. Maximum 5 MB.
                    </p>
                  </div> */}

                  {imagePreview && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-gray-700">Image Preview</p>
                      <img
                        src={imagePreview}
                        alt="Tiffin preview"
                        className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                        onLoad={(event) => {
                          event.currentTarget.style.display = "block";
                        }}
                      />
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4">
                    <input  type="checkbox"  name="is_available" checked={form.is_available}  onChange={handleChange}
                      className="h-5 w-5 accent-orange-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">Tiffin Available आहे</p>
                      <p className="text-xs text-gray-500">
                        Customer ला हा tiffin order करता येईल.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
                  <button  type="button"  onClick={closeForm} disabled={saving}
                    className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button  type="submit"  disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving && <Loader2 size={18} className="animate-spin" />}
                    {saving
                      ? "Saving..."
                      : editingId !== null
                      ? "Update Tiffin"
                      : "Add Tiffin"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
