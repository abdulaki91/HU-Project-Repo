import { useState, useEffect } from "react";
import { Star, MessageSquare, User, Calendar } from "lucide-react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { Label } from "./Label";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext";
import useFetchResource from "../hooks/useFetchResource";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

export default function ProjectRating({ project }) {
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch project ratings and statistics
  const { data: ratingsData, isLoading: ratingsLoading } = useFetchResource(
    `rating/project/${project.id}`,
    ["project-ratings", project.id],
  );

  // Fetch user's existing rating
  const { data: existingRating } = useFetchResource(
    user ? `rating/project/${project.id}/my-rating` : null,
    ["user-rating", project.id, user?.id],
    { enabled: !!user },
  );

  useEffect(() => {
    if (existingRating) {
      setUserRating(existingRating.rating);
      setUserReview(existingRating.review || "");
    }
  }, [existingRating]);

  // Submit rating mutation
  const submitRatingMutation = useMutation({
    mutationFn: async ({ rating, review }) => {
      const { data } = await api.post(`/rating/project/${project.id}`, {
        rating,
        review: review && review.trim() ? review.trim() : "",
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Rating submitted successfully!", {
        title: "Thank you!",
        description: "Your rating helps other students find great projects.",
      });
      queryClient.invalidateQueries(["project-ratings", project.id]);
      queryClient.invalidateQueries(["user-rating", project.id, user?.id]);
      setShowReviewForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit rating", {
        title: "Rating Error",
        description: "Please try again or contact support.",
      });
    },
  });

  // Delete rating mutation
  const deleteRatingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete(`/rating/project/${project.id}`);
      return data;
    },
    onSuccess: () => {
      toast.success("Rating removed successfully!", {
        title: "Rating Removed",
        description: "Your rating has been removed from this project.",
      });
      queryClient.invalidateQueries(["project-ratings", project.id]);
      queryClient.invalidateQueries(["user-rating", project.id, user?.id]);
      setUserRating(0);
      setUserReview("");
      setShowReviewForm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove rating", {
        title: "Error",
        description: "Please try again or contact support.",
      });
    },
  });

  const handleStarClick = (rating) => {
    if (!user) {
      toast.error("Please log in to rate projects", {
        title: "Login Required",
        description: "You need to be logged in to rate projects.",
      });
      return;
    }

    if (user.id === project.author_id) {
      toast.error("You cannot rate your own project", {
        title: "Not Allowed",
        description: "Project authors cannot rate their own projects.",
      });
      return;
    }

    setUserRating(rating);
    setShowReviewForm(true);
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast.error("Please select a rating", {
        title: "Rating Required",
        description: "You must select at least 1 star to submit a rating.",
      });
      return;
    }

    // Safely handle review validation
    const reviewText = userReview || "";
    const trimmedReview = reviewText.trim();

    // Validate review if provided (optional but with constraints)
    if (trimmedReview && trimmedReview.length < 10) {
      toast.error("Review is too short", {
        title: "Review Validation",
        description:
          "If you provide a review, it must be at least 10 characters long.",
      });
      return;
    }

    if (trimmedReview && trimmedReview.length > 1000) {
      toast.error("Review is too long", {
        title: "Review Validation",
        description: "Review cannot exceed 1000 characters.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRatingMutation.mutateAsync({
        rating: userRating,
        review: trimmedReview || "", // Send empty string if empty
      });
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error("Failed to submit rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRating = async () => {
    // Check if user actually has a rating to remove
    if (!existingRating) {
      toast.error("No rating to remove", {
        title: "No Rating Found",
        description: "You haven't rated this project yet.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteRatingMutation.mutateAsync();
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error("Failed to remove rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : "0.0";
  };

  const renderStars = (rating, interactive = false, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = interactive
        ? (hoverRating || userRating) >= starValue
        : rating >= starValue;

      return (
        <Star
          key={index}
          className={`${size} cursor-pointer transition-colors ${
            isFilled
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          } ${interactive ? "hover:text-yellow-400 hover:fill-yellow-400" : ""}`}
          onClick={interactive ? () => handleStarClick(starValue) : undefined}
          onMouseEnter={
            interactive ? () => setHoverRating(starValue) : undefined
          }
          onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
        />
      );
    });
  };

  const renderRatingDistribution = () => {
    if (!ratingsData?.stats || ratingsData.stats.totalRatings === 0)
      return null;

    const { stats } = ratingsData;
    const total = stats.totalRatings;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-slate-600 dark:text-slate-400">
                {star}★
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-xs text-slate-500 dark:text-slate-400">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (ratingsLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      </div>
    );
  }

  const stats = ratingsData?.stats || { totalRatings: 0, averageRating: 0 };
  const ratings = ratingsData?.ratings || [];

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-800/50">
        <div className="flex items-start gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {formatRating(stats.averageRating)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(stats.averageRating)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {stats.totalRatings}{" "}
              {stats.totalRatings === 1 ? "rating" : "ratings"}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              Rating Distribution
            </h4>
            {renderRatingDistribution()}
          </div>
        </div>

        {/* User Rating Section */}
        {user && user.id !== project.author_id && (
          <div className="mt-6 pt-6 border-t border-yellow-200/50 dark:border-yellow-800/50">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              {existingRating ? "Your Rating" : "Rate this Project"}
            </h4>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(0, true, "w-6 h-6")}
              </div>
              {userRating > 0 && (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {userRating} star{userRating !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {showReviewForm && (
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="review"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Review (Optional)
                  </Label>
                  <Textarea
                    id="review"
                    value={userReview}
                    onChange={(e) => setUserReview(e.target.value)}
                    placeholder="Share your thoughts about this project... (minimum 10 characters if provided)"
                    className="mt-1"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center text-xs mt-1">
                    <div className="text-slate-500 dark:text-slate-400">
                      {userReview &&
                        userReview.trim().length > 0 &&
                        userReview.trim().length < 10 && (
                          <span className="text-amber-600 dark:text-amber-400">
                            Minimum 10 characters required
                          </span>
                        )}
                      {userReview && userReview.trim().length >= 10 && (
                        <span className="text-green-600 dark:text-green-400">
                          ✓ Review looks good
                        </span>
                      )}
                    </div>
                    <div
                      className={`${
                        userReview.length > 900
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {userReview.length}/1000 characters
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitRating}
                    disabled={isSubmitting || userRating === 0}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : existingRating
                        ? "Update Rating"
                        : "Submit Rating"}
                  </Button>

                  {existingRating && (
                    <Button
                      onClick={handleRemoveRating}
                      disabled={isSubmitting}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      {isSubmitting ? "Removing..." : "Remove Rating"}
                    </Button>
                  )}

                  <Button
                    onClick={() => {
                      setShowReviewForm(false);
                      if (!existingRating) {
                        setUserRating(0);
                        setUserReview("");
                      }
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Login Prompt */}
        {!user && (
          <div className="mt-6 pt-6 border-t border-yellow-200/50 dark:border-yellow-800/50">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              <a
                href="/login"
                className="text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                Log in
              </a>{" "}
              to rate and review this project
            </p>
          </div>
        )}
      </div>

      {/* Recent Reviews */}
      {ratings.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Reviews
          </h4>

          <div className="space-y-4">
            {ratings.slice(0, 5).map((rating) => (
              <div
                key={rating.id}
                className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {rating.user.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {rating.user.department} • Batch {rating.user.batch}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(rating.rating, false, "w-4 h-4")}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {rating.review && (
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {rating.review}
                  </p>
                )}
              </div>
            ))}
          </div>

          {ratings.length > 5 && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm">
                View All Reviews ({ratingsData.pagination.total})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
