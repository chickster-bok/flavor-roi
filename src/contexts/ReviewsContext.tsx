'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Review {
  id: string;
  recipeId: string;
  rating: number; // 1-5
  comment: string;
  reviewerName: string;
  createdAt: string;
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (recipeId: string, rating: number, comment: string, reviewerName: string) => void;
  getRecipeReviews: (recipeId: string) => Review[];
  getRecipeRating: (recipeId: string) => { average: number; count: number };
  getUserReview: (recipeId: string) => Review | undefined;
  deleteReview: (reviewId: string) => void;
}

const STORAGE_KEY = 'flavor-roi-reviews';

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReviews(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (recipeId: string, rating: number, comment: string, reviewerName: string) => {
    // Remove existing review for this recipe (one review per recipe)
    const filtered = reviews.filter(r => r.recipeId !== recipeId);

    const newReview: Review = {
      id: `review-${Date.now()}`,
      recipeId,
      rating: Math.min(5, Math.max(1, rating)),
      comment,
      reviewerName: reviewerName || 'Anonymous Chef',
      createdAt: new Date().toISOString(),
    };

    setReviews([newReview, ...filtered]);
  };

  const getRecipeReviews = (recipeId: string): Review[] => {
    return reviews.filter(r => r.recipeId === recipeId);
  };

  const getRecipeRating = (recipeId: string): { average: number; count: number } => {
    const recipeReviews = getRecipeReviews(recipeId);
    if (recipeReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const sum = recipeReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / recipeReviews.length) * 10) / 10,
      count: recipeReviews.length,
    };
  };

  const getUserReview = (recipeId: string): Review | undefined => {
    return reviews.find(r => r.recipeId === recipeId);
  };

  const deleteReview = (reviewId: string) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        getRecipeReviews,
        getRecipeRating,
        getUserReview,
        deleteReview,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
