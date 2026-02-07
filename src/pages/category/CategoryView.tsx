import {
  Image as ImageIcon,
  Folder,
  AlertCircle,
  Eye,
  Edit,
  Calendar,
  Clock,
  FolderUp,
} from "lucide-react";
import { Button } from "../../components/common/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
import SubHeader from "../../components/common/SubHeader";
import QuickTip from "../../components/common/QuickTip";
import { useGetCategory } from "../../api/category";
import { Loader } from "../../components/common/Loader";
import { TruncatedText } from "../../components/common/TruncatedText";
import { ImageCarousel } from "../../components/common/ImageCarouselWithRef";
import { ErrorState } from "../../components/common/ErrorState";
import { ExpandableCard } from "../../components/common/ExpandableCard";
import { formatDateTime } from "../../utils/date.utils";

export default function CategoryView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch category data
  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
    refetch: refetchCategory,
  } = useGetCategory(id!);

  // Loading state
  if (isLoadingCategory) return <Loader text="Loading category..." />;

  // Error state
  if (categoryError) {
    return (
      <ErrorState
        error={categoryError}
        onRetry={() => refetchCategory()}
        title="Failed to load category"
      />
    );
  }

  // Extract category data
  const category = categoryData.data;
  const parentCategoryName = category.parent?.name || "None (Main Category)";
  const createdAt = category.created_at;
  const updatedAt = category.updated_at;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <SubHeader
          title="View Category"
          description={`View the details of "${category.name}"`}
          icon={Eye}
          iconBackground="green"
          badge={{
            variant: "green",
            dot: true,
            text: `ID: ${id?.substring(0, 8)}...`,
          }}
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <form className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Images Carousel */}
              <div className="lg:w-1/2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600 shrink-0" />
                  <span className="truncate">Category Images</span>
                </h2>
                <ImageCarousel images={categoryData?.data?.images || []} />
              </div>

              {/* Right Column: Basic Information */}
              <div className="lg:w-1/2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Folder className="h-5 w-5 text-blue-600 shrink-0" />
                  <span className="truncate">Basic Information</span>
                </h2>

                <div className="space-y-4">
                  {/* Category Name */}
                  <ExpandableCard
                    title="Category Name"
                    defaultExpanded={true}
                    icon={Folder}
                  >
                    <div className="text-slate-900 dark:text-white">
                      <TruncatedText
                        text={category.name}
                        maxLength={100}
                        className="text-lg font-semibold"
                      />
                    </div>
                  </ExpandableCard>

                  {/* Parent Category */}
                  <ExpandableCard
                    title="Parent Category"
                    defaultExpanded={true}
                    icon={FolderUp}
                  >
                    <div className="text-slate-900 dark:text-white">
                      <TruncatedText
                        text={parentCategoryName}
                        maxLength={100}
                        className="text-lg font-semibold"
                      />
                      {category.parent?._id && (
                        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Parent ID:{" "}
                          {/* <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                            {category.parent._id}
                          </span> */}
                          <Link
                            to={`/category/view/${category.parent._id}`}
                            className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded
                                     text-blue-600 dark:text-blue-400 hover:underline
                                     hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                          >
                            {category.parent._id}
                          </Link>
                        </div>
                      )}
                    </div>
                  </ExpandableCard>

                  {/* Status */}
                  <ExpandableCard
                    title="Status"
                    defaultExpanded={true}
                    icon={AlertCircle}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${category.is_active ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span
                        className={`text-lg font-semibold truncate ${category.is_active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {category.is_active
                        ? "This category is currently visible to users"
                        : "This category is hidden from users"}
                    </div>
                  </ExpandableCard>

                  {/* Description */}
                  <ExpandableCard
                    title="Description"
                    defaultExpanded={true}
                    icon={Edit}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {category.description ? (
                        <div className="text-slate-700 dark:text-slate-300">
                          <TruncatedText
                            text={category.description}
                            maxLength={500}
                            lines={6}
                            expandLabel="Read full description"
                            collapseLabel="Show less"
                          />
                        </div>
                      ) : (
                        <p className="text-slate-400 dark:text-slate-500 italic">
                          No description provided
                        </p>
                      )}
                    </div>
                  </ExpandableCard>

                  {/* Timestamps */}

                  <ExpandableCard
                    title="Timestamps"
                    defaultExpanded={true}
                    icon={Calendar}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Created At */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Created At
                          </span>
                        </div>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {createdAt ? (
                            <>
                              <div className="font-medium">
                                {formatDateTime(createdAt, "datetime")}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                ({formatDateTime(createdAt, "ago")})
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">
                              N/A
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Updated At */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Updated At
                          </span>
                        </div>
                        <div className="text-sm text-slate-900 dark:text-white">
                          {updatedAt ? (
                            <>
                              <div className="font-medium">
                                {formatDateTime(updatedAt, "datetime")}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                ({formatDateTime(updatedAt, "ago")})
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">
                              N/A
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ExpandableCard>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => navigate("/categories")}
                variant="secondary"
                className="flex-1"
              >
                Back to Categories
              </Button>
              <Button
                type="button"
                variant="primary"
                icon={Edit}
                className="flex-1"
                onClick={() => {
                  navigate(`/category/edit/${id}`);
                }}
              >
                Edit Category
              </Button>
            </div>

            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400 text-center flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" />
              View mode - No changes can be made here
            </p>
          </form>
        </div>

        <QuickTip
          title="Category View Tips"
          tips={[
            "This page is read-only. Use the 'Edit Category' button to make changes.",
            "Click on each section header to expand or collapse category details.",
            "Inactive categories are hidden from users but remain available for admins.",
            "Parent category information helps understand where this category appears in the hierarchy.",
            "Uploaded images are shown in a carousel — swipe or click arrows to view all.",
            "Creation and update timestamps help track category changes over time.",
          ]}
          className="mt-8"
        />
      </div>
    </div>
  );
}
