import React, { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  Upload,
  X,
  Image as ImageIcon,
  Link,
  Folder,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import SubHeader from "../../components/common/SubHeader";
import QuickTip from "../../components/common/QuickTip";
import { toast } from "react-hot-toast";
import {
  useCategoryLabels,
  useCategoryStats,
  useCreateCategory,
} from "../../api/category";
import Dropdown from "../../components/common/Dropdown";
import type { CategoryFormData, CategoryLabel } from "../../types/category";
import { is_valid_url } from "../../utils/url.utils";

// Custom hook for image management
const useImageManager = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));

      if (imageFiles.length !== files.length) {
        return { success: false, error: "Please select only image files" };
      }

      setUploadedImages((prev) => [...prev, ...imageFiles]);
      event.target.value = "";

      return { success: true, count: imageFiles.length };
    },
    [],
  );

  const removeUploadedImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    uploadedImages,
    handleFileUpload,
    removeUploadedImage,
  };
};

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
        options.push({
          value: category._id,
          label: category.name,
        });
      });
    }

    return options;
  }, [categoriesLabels]);

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
                value="true"
                {...register("is_active")}
                defaultChecked
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="false"
                {...register("is_active")}
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

const ImagePreviewGrid = React.memo(
  ({
    images,
    onRemoveImage,
    watchedImagesCount,
  }: {
    images: string[];
    onRemoveImage: (index: number) => void;
    watchedImagesCount: number;
  }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={`${image}-${index}`} className="relative group">
          <div className="aspect-square rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600">
            <img
              src={image}
              alt={`Category preview ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='10' fill='%2394a3b8'%3EImage%3C/text%3E%3C/svg%3E";
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
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {index < watchedImagesCount ? "URL" : "Uploaded"}
          </div>
        </div>
      ))}
    </div>
  ),
);

export default function CategoryNew() {
  const navigate = useNavigate();
  const [currentUrl, setCurrentUrl] = useState("");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const { uploadedImages, handleFileUpload, removeUploadedImage } =
    useImageManager();

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

  const { mutate: categoryMutate, isPending: categoryLoading } =
    useCreateCategory();

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
  } = form;

  const watchedDescription = watch("description");
  const watchedImages = watch("images") || [];
  const watchedName = watch("name");
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
      ...watchedImages,
      ...uploadedImages.map((file) => URL.createObjectURL(file)),
    ],
    [watchedImages, uploadedImages],
  );

  const isFormValid = useMemo(
    () => isValid && watchedName?.trim().length >= 3,
    [isValid, watchedName],
  );

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
          message: "Please enter a valid URL (e.g., https://example.com)",
        });
        return;
      }

      // Check for duplicates
      if (watchedImages.includes(currentUrl)) {
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
        message: "Please enter a valid URL (e.g., https://example.com)",
      });
    }
  }, [currentUrl, watchedImages, setValue, setError, clearErrors]);

  const handleFileUploadWrapper = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const result = handleFileUpload(event);
      if (result.success) {
        toast.success(`Added ${result.count} image file(s)`);
      } else if (result.error) {
        setError("images", { message: result.error });
      }
    },
    [handleFileUpload, setError],
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
      if (index < watchedImages.length) {
        removeUrlImage(index);
      } else {
        removeUploadedImage(index - watchedImages.length);
        toast.success("Image removed");
      }
    },
    [watchedImages.length, removeUrlImage, removeUploadedImage],
  );

  const onSubmit = useCallback(
    async (data: CategoryFormData) => {
      try {
        const formData = new FormData();
        formData.append("name", data.name.trim());
        formData.append("description", data.description.trim());
        formData.append("is_active", data.is_active.toString());

        if (data.parent) formData.append("parent", data.parent);
        uploadedImages.forEach((file) => formData.append("images", file));
        if (data.images.length > 0)
          formData.append("urls", JSON.stringify(data.images));

        categoryMutate(formData, {
          onSuccess: () => {
            toast.success("Category created successfully! 🎉");
            refetchCategoriesLabels();
            refetchStatsCategories();
            setTimeout(() => navigate("/categories"), 1500);
          },
          onError: (err: any) => {
            const errorMessage =
              err?.response?.data?.message ||
              err?.message ||
              "Something went wrong. Please try again.";
            setError("root", { message: errorMessage });
            toast.error(errorMessage);
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
    [uploadedImages, categoryMutate, navigate, setError],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-1xl mx-auto px-4 sm:px-6 py-8">
        <SubHeader
          title="Create New Category"
          description="Add a new product category to organize your inventory"
          icon={Folder}
          iconBackground="blue"
          badge={{ variant: "blue", dot: true, text: "New Category" }}
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
                  Upload Images
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
                {errors.images && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.images.message}
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
                    watchedImagesCount={watchedImages.length}
                  />
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
                disabled={isSubmitting || categoryLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Plus}
                className="flex-1"
                disabled={!isFormValid || isSubmitting || categoryLoading}
                loading={isSubmitting || categoryLoading}
              >
                Create Category
              </Button>
            </div>

            {errors.root && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.root.message}
              </p>
            )}
          </form>
        </div>

        <QuickTip
          title="Category Tips"
          tips={[
            "Use clear, descriptive names that customers will understand",
            "Create a logical hierarchy with parent and child categories",
            "Add high-quality images that represent the category well",
            "Use descriptions to help with SEO and customer navigation",
            "Validate image URLs before adding them to ensure they work properly",
          ]}
        />
      </div>
    </div>
  );
}
