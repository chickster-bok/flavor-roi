'use client';

import { useState } from 'react';
import { useReviews } from '@/contexts/ReviewsContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Trash2, Edit2, Check, X } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

export function StarRating({ rating, onRate, size = 'md', readonly = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => onRate?.(star)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface RecipeReviewProps {
  recipeId: string;
}

export function RecipeReview({ recipeId }: RecipeReviewProps) {
  const { getUserReview, addReview, deleteReview, getRecipeRating } = useReviews();
  const { profile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const existingReview = getUserReview(recipeId);
  const recipeRating = getRecipeRating(recipeId);

  const handleSubmit = () => {
    if (rating === 0) return;
    addReview(recipeId, rating, comment, profile.displayName);
    setIsEditing(false);
    setRating(0);
    setComment('');
  };

  const handleEdit = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRating(0);
    setComment('');
  };

  const handleDelete = () => {
    if (existingReview) {
      deleteReview(existingReview.id);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Rate This Recipe
          </h3>
          {recipeRating.count > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <StarRating rating={recipeRating.average} size="sm" readonly />
              <span className="text-muted-foreground">
                ({recipeRating.average.toFixed(1)})
              </span>
            </div>
          )}
        </div>

        {existingReview && !isEditing ? (
          // Show existing review
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Reviewer Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {(existingReview.reviewerName || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{existingReview.reviewerName || 'Anonymous Chef'}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={handleEdit}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <StarRating rating={existingReview.rating} size="sm" readonly />
              </div>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                "{existingReview.comment}"
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
            </p>
          </div>
        ) : isEditing || !existingReview ? (
          // Show rating form
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Your rating:</span>
              <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>
            <Textarea
              placeholder="Share your thoughts about this recipe (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                {existingReview ? 'Update Review' : 'Submit Review'}
              </Button>
              {isEditing && (
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
