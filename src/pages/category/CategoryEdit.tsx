import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Upload,
  X,
  Image as ImageIcon,
  Link,
  Folder,
  Save,
  AlertCircle,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { useNavigate, useParams } from "react-router-dom";
import SubHeader from "../../components/common/SubHeader";
import QuickTip from "../../components/common/QuickTip";
import { toast } from "react-hot-toast";
import Dropdown from "../../components/common/Dropdown";
import {
  useCategoryLabels,
  useCategoryStats,
  useGetCategory,
  useUpdateCategory,
} from "../../api/category";
import { Loader } from "../../components/common/Loader";
import type { CategoryLabel } from "../../types/category";
import { is_valid_url } from "../../utils/url.utils";

// Types
interface CategoryFormData {
  id: string;
  name: string;
  description: string;
  images: string[];
  urlInput?: string;
  parent: string | null;
  is_active: boolean;
}

// Custom hook for image management
const useImageManager = (initialImages: string[] = []) => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: string }>({});

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          errors.push(`${file.name} is not an image file`);
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          errors.push(`${file.name} exceeds 10MB size limit`);
          return;
        }

        validFiles.push(file);
      });

      if (errors.length > 0) {
        setImageErrors((prev) => ({
          ...prev,
          fileUpload: errors.join(", "),
        }));
      } else {
        setImageErrors((prev) => ({ ...prev, fileUpload: "" }));
      }

      if (validFiles.length > 0) {
        setUploadedImages((prev) => [...prev, ...validFiles]);
      }

      event.target.value = "";

      return {
        success: validFiles.length > 0,
        count: validFiles.length,
        errors: errors.length > 0 ? errors.join(", ") : null,
      };
    },
    [],
  );

  const removeUploadedImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback((index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addExistingImage = useCallback((url: string) => {
    setExistingImages((prev) => [...prev, url]);
  }, []);

  const clearImageErrors = useCallback(() => {
    setImageErrors({});
  }, []);

  return {
    uploadedImages,
    existingImages,
    imageErrors,
    handleFileUpload,
    removeUploadedImage,
    removeExistingImage,
    addExistingImage,
    setExistingImages,
    clearImageErrors,
  };
};

// Image Preview Grid Component
const ImagePreviewGrid = React.memo(
  ({
    images,
    onRemoveImage,
    imageTypes,
  }: {
    images: string[];
    onRemoveImage: (index: number) => void;
    imageTypes: ("existing" | "url" | "uploaded")[];
  }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div
          key={`${image}-${index}-${imageTypes[index]}`}
          className="relative group"
        >
          <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
            <img
              src={image}
              alt={`Category preview ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='%2394a3b8'%3EImage%3C/text%3E%3C/svg%3E`;
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemoveImage(index)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 shadow-lg"
            title="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 text-center capitalize">
            {imageTypes[index]}
          </div>
        </div>
      ))}
    </div>
  ),
);

// Basic Info Section Component
const BasicInfoSection = ({
  register,
  errors,
  watchedDescription,
  categoriesLabels,
  isLoadingCategories,
  categoriesError,
  selectedParent,
  onParentChange,
  currentCategoryId,
  watch,
  setValue,
}: {
  register: any;
  errors: any;
  watchedDescription: string;
  watchedName: string;
  categoriesLabels: any;
  isLoadingCategories: boolean;
  categoriesError: any;
  selectedParent: string | null;
  onParentChange: (value: string | null) => void;
  currentCategoryId?: string;
  watch: any;
  setValue: any;
}) => {
  const parentOptions = useMemo(() => {
    const options = [
      {
        value: "",
        label: "No Parent (Main Category)",
      },
    ];

    if (Array.isArray(categoriesLabels)) {
      categoriesLabels.forEach((category) => {
        if (category._id === currentCategoryId) return;

        options.push({
          value: category._id,
          label: category.name,
        });
      });
    }

    return options;
  }, [categoriesLabels, currentCategoryId]);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Folder className="h-5 w-5 text-blue-600" />
        Basic Information
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            {...register("name", {
              required: "Category name is required",
              minLength: {
                value: 3,
                message: "Category name must be at least 3 characters",
              },
              maxLength: {
                value: 100,
                message: "Category name must be less than 100 characters",
              },
              validate: (value: string) => {
                const trimmed = value.trim();
                if (trimmed.length < 3) {
                  return "Category name cannot be just whitespace";
                }
                return true;
              },
            })}
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.name
                ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent"
            }`}
            placeholder="e.g., Electronics, Clothing, Home & Kitchen"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Parent Category
          </label>
          <Dropdown
            options={parentOptions}
            value={selectedParent || ""}
            onValueChange={(value) => onParentChange(value || null)}
            placeholder="Select parent category"
            searchPlaceholder="Search categories..."
            icon={<Folder className="h-4 w-4" />}
            disabled={isLoadingCategories}
            clearLabel="Remove selection"
          />
          {isLoadingCategories && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Loading categories...
            </p>
          )}
          {categoriesError && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Failed to load parent categories
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Status
          </label>
          <div className="flex items-center gap-4 p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={watch("is_active") === true}
                onChange={() =>
                  setValue("is_active", true, { shouldValidate: true })
                }
                value="true"
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={watch("is_active") === false}
                onChange={() =>
                  setValue("is_active", false, { shouldValidate: true })
                }
                value="false"
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Inactive
              </span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            {...register("description", {
              maxLength: {
                value: 500,
                message: "Description must be less than 500 characters",
              },
            })}
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.description
                ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent"
            }`}
            placeholder="Describe this category and what products it contains..."
          />
          <div className="flex justify-between mt-2">
            {errors.description ? (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.description.message}
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Optional but recommended
              </p>
            )}
            <p
              className={`text-sm flex items-center gap-1 ${
                (watchedDescription?.length || 0) > 450
                  ? "text-amber-600"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {(watchedDescription?.length || 0) > 450 && (
                <AlertCircle className="h-3 w-3" />
              )}
              {watchedDescription?.length || 0}/500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUrl, setCurrentUrl] = useState("");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  // Fetch category data
  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useGetCategory(id!);

  const {
    uploadedImages,
    existingImages,
    imageErrors,
    handleFileUpload,
    removeUploadedImage,
    removeExistingImage,
    // addExistingImage,
    setExistingImages,
    clearImageErrors,
  } = useImageManager(categoryData?.data?.images || []);

  const {
    data: categoriesLabelsData,
    isLoading: isLoadingCategoriesLabels,
    error: categoriesLabelsError,
    refetch: refetchCategoriesLabels,
  } = useCategoryLabels();
  const { refetch: refetchStatsCategories } = useCategoryStats();
  const categoriesLabels: CategoryLabel[] = useMemo(() => {
    return (categoriesLabelsData || []).filter(
      (label) => label.is_active === true,
    );
  }, [categoriesLabelsData]);

  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      description: "",
      images: [],
      parent: null,
      is_active: true,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setError,
    watch,
    setValue,
    clearErrors,
    reset,
  } = form;

  const watchedDescription = watch("description");
  const watchedImages = watch("images") || [];
  const watchedName = watch("name");
  const watchedIsActive = watch("is_active");

  // Initialize form with category data when loaded
  useEffect(() => {
    if (categoryData?.data) {
      const category = categoryData.data;
      reset({
        name: category.name || "",
        description: category.description || "",
        images: [],
        parent: category.parent || null,
        is_active: category.is_active ?? true,
      });
      setSelectedParent(category.parent || null);
      setExistingImages(category.images || []);
    }
  }, [categoryData?.data, reset, setExistingImages]);

  // Handle parent category change
  const handleParentChange = useCallback(
    (value: string | null) => {
      setSelectedParent(value);
      setValue("parent", value, { shouldValidate: true });
    },
    [setValue],
  );

  // Memoized values
  const allImages = useMemo(
    () => [
      ...existingImages,
      ...watchedImages,
      ...uploadedImages.map((file) => URL.createObjectURL(file)),
    ],
    [existingImages, watchedImages, uploadedImages],
  );

  const imageTypes = useMemo(() => {
    return [
      ...existingImages.map(() => "existing" as const),
      ...watchedImages.map(() => "url" as const),
      ...uploadedImages.map(() => "uploaded" as const),
    ];
  }, [existingImages.length, watchedImages.length, uploadedImages.length]);

  const isFormValid = useMemo(
    () => isValid && watchedName?.trim().length >= 2,
    [isValid, watchedName],
  );

  const hasChanges = useMemo(() => {
    const originalData = categoryData?.data;
    if (!originalData) return false;

    const currentData = {
      name: watchedName?.trim(),
      description: watchedDescription?.trim(),
      parent: selectedParent,
      is_active: watchedIsActive,
      images: existingImages,
    };

    const original = {
      name: originalData.name?.trim(),
      description: originalData.description?.trim(),
      parent: originalData.parent,
      is_active: originalData.is_active,
      images: originalData.images || [],
    };

    return (
      currentData.name !== original.name ||
      currentData.description !== original.description ||
      currentData.parent !== original.parent ||
      currentData.is_active !== original.is_active ||
      JSON.stringify(currentData.images) !== JSON.stringify(original.images) ||
      watchedImages.length > 0 ||
      uploadedImages.length > 0
    );
  }, [
    categoryData,
    watchedName,
    watchedDescription,
    selectedParent,
    watchedIsActive,
    existingImages,
    watchedImages,
    uploadedImages,
  ]);

  // Simple URL add handler
  const handleAddUrl = useCallback(() => {
    if (!currentUrl.trim()) {
      setError("urlInput", { message: "Please enter a URL" });
      return;
    }

    try {
      // Simple URL validation
      if (!is_valid_url(currentUrl)) {
        setError("urlInput", {
          message:
            "Please enter a valid URL (e.g., https://example.com/image.jpg)",
        });
        return;
      }

      // Check for duplicates in all image sources
      const allCurrentImages = [...existingImages, ...watchedImages];
      if (allCurrentImages.includes(currentUrl)) {
        setError("urlInput", { message: "This URL is already added" });
        return;
      }

      // Add URL to images
      setValue("images", [...watchedImages, currentUrl], {
        shouldValidate: true,
      });

      toast.success("Image URL added successfully");
      setCurrentUrl("");
      clearErrors("urlInput");
    } catch (error) {
      setError("urlInput", {
        message:
          "Please enter a valid URL (e.g., https://example.com/image.jpg)",
      });
    }
  }, [
    currentUrl,
    existingImages,
    watchedImages,
    setValue,
    setError,
    clearErrors,
  ]);

  const handleFileUploadWrapper = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      clearImageErrors();
      const result = handleFileUpload(event);
      if (result.success && result.count > 0) {
        toast.success(`Added ${result.count} image file(s)`);
      } else if (result.errors) {
        toast.error(result.errors);
      }
    },
    [handleFileUpload, clearImageErrors],
  );

  const removeUrlImage = useCallback(
    (index: number) => {
      const newImages = watchedImages.filter((_, i) => i !== index);
      setValue("images", newImages, { shouldValidate: true });
      toast.success("Image URL removed");
    },
    [watchedImages, setValue],
  );

  const handleImageRemove = useCallback(
    (index: number) => {
      if (index < existingImages.length) {
        removeExistingImage(index);
        toast.success("Existing image removed");
      } else if (index < existingImages.length + watchedImages.length) {
        removeUrlImage(index - existingImages.length);
      } else {
        removeUploadedImage(
          index - existingImages.length - watchedImages.length,
        );
        toast.success("Uploaded image removed");
      }
    },
    [
      existingImages.length,
      watchedImages.length,
      removeExistingImage,
      removeUrlImage,
      removeUploadedImage,
    ],
  );

  const onSubmit = useCallback(
    async (data: CategoryFormData) => {
      if (!id) {
        toast.error("Category ID is missing");
        return;
      }

      try {
        const formData = new FormData();

        // Append basic fields
        formData.append("id", id);
        formData.append("name", data.name.trim());
        formData.append("description", data.description.trim());
        formData.append("is_active", data.is_active.toString());

        if (data.parent) {
          formData.append("parent", data.parent);
        } else {
          formData.append("parent", "");
        }

        // Add existing images (ones that weren't removed)
        if (existingImages.length > 0) {
          formData.append("existing_images", JSON.stringify(existingImages));
        }

        // Add new URL images
        if (data.images.length > 0) {
          formData.append("urls", JSON.stringify(data.images));
        }

        // Add uploaded files
        uploadedImages.forEach((file) => {
          formData.append("images", file);
        });

        updateCategory(formData, {
          onSuccess: (response) => {
            toast.success(
              response?.message || "Category updated successfully! 🎉",
            );
            refetchCategoriesLabels();
            refetchStatsCategories();
            setTimeout(() => navigate("/categories"), 1500);
          },
          onError: (err: any) => {
            const errorMessage =
              err?.response?.data?.message ||
              err?.message ||
              "Something went wrong. Please try again.";

            if (err?.response?.data?.errors) {
              // Handle validation errors
              err.response.data.errors.forEach((error: string) => {
                toast.error(error);
              });
            } else {
              setError("root", { message: errorMessage });
              toast.error(errorMessage);
            }
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to process form data";
        setError("root", { message: errorMessage });
        toast.error(errorMessage);
      }
    },
    [
      id,
      existingImages,
      uploadedImages,
      updateCategory,
      navigate,
      setError,
      refetchCategoriesLabels,
      refetchStatsCategories,
    ],
  );

  // Loading state
  if (isLoadingCategory) return <Loader />;

  // Error state
  if (categoryError || !categoryData?.data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Failed to load category
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {categoryError?.message || "Category not found or access denied"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate("/categories")}
              variant="secondary"
              icon={ArrowLeft}
            >
              Back to Categories
            </Button>
            <Button onClick={() => window.location.reload()} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-1xl mx-auto px-4 sm:px-6 py-8">
        <SubHeader
          title="Edit Category"
          description={`Update the details for "${categoryData?.data?.name}"`}
          icon={Edit}
          iconBackground="blue"
          badge={{
            variant: "blue",
            dot: true,
            text: `ID: ${id?.substring(0, 8)}...`,
          }}
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
            <BasicInfoSection
              register={register}
              errors={errors}
              watchedDescription={watchedDescription}
              watchedName={watchedName}
              // parentCategories={parentCategories}
              categoriesLabels={categoriesLabels}
              isLoadingCategories={isLoadingCategoriesLabels}
              categoriesError={categoriesLabelsError}
              selectedParent={selectedParent}
              onParentChange={handleParentChange}
              currentCategoryId={id}
              watch={watch}
              setValue={setValue}
            />

            {/* Images Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                Category Images
                {allImages.length > 0 && (
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                    ({allImages.length} image{allImages.length !== 1 ? "s" : ""}
                    )
                  </span>
                )}
              </h2>

              {/* Simple URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Add Image URL
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => {
                        setCurrentUrl(e.target.value);
                        if (errors.urlInput) clearErrors("urlInput");
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.urlInput
                          ? "border-red-300 dark:border-red-700 focus:ring-red-500"
                          : "border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddUrl}
                    variant="secondary"
                    icon={Link}
                    className="whitespace-nowrap"
                    disabled={!currentUrl.trim()}
                  >
                    Add URL
                  </Button>
                </div>

                {errors.urlInput && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.urlInput.message}
                  </p>
                )}

                {!errors.urlInput && (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Enter a valid image URL starting with http:// or https://
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Upload New Images
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 sm:p-8 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors duration-200">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUploadWrapper}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        PNG, JPG, GIF, WEBP up to 10MB each
                      </p>
                    </div>
                  </label>
                </div>
                {imageErrors.fileUpload && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {imageErrors.fileUpload}
                  </p>
                )}
              </div>

              {/* Image Previews */}
              {allImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Image Previews ({allImages.length})
                  </h3>
                  <ImagePreviewGrid
                    images={allImages}
                    onRemoveImage={handleImageRemove}
                    imageTypes={imageTypes}
                  />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    <strong>Note:</strong> Removing existing images will delete
                    them from the category. New URLs and uploaded files will be
                    added when you save.
                  </p>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => navigate("/categories")}
                variant="secondary"
                className="flex-1"
                disabled={isSubmitting || isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                className="flex-1"
                disabled={
                  !isFormValid || !hasChanges || isSubmitting || isUpdating
                }
                loading={isSubmitting || isUpdating}
              >
                Update Category
              </Button>
            </div>

            {errors.root && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.root.message}
              </p>
            )}

            {!hasChanges && (
              <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 text-center flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" />
                No changes made to the category
              </p>
            )}
          </form>
        </div>

        <QuickTip
          title="Editing Tips"
          tips={[
            "Update category names to reflect current product offerings",
            "Reorganize category hierarchy to improve navigation",
            "Refresh images to keep your store looking current",
            "Test all image URLs to ensure they load properly",
            "Consider SEO implications when changing names and descriptions",
            "Use descriptive names that are easy for customers to understand",
          ]}
        />
      </div>
    </div>
  );
}
