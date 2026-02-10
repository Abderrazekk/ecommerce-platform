// ecommerce-frontend/src/components/common/StarRating.jsx
import { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = "md",
  showNumber = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  const handleMouseEnter = (index) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => {
          const isFilled = index <= displayRating;
          return (
            <button
              key={index}
              type="button"
              className={`${readOnly ? "cursor-default" : "cursor-pointer"} transition-transform hover:scale-110 ${
                sizes[size]
              }`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(index)}
              disabled={readOnly}
              aria-label={`Rate ${index} out of 5 stars`}
            >
              <Star
                className={`${isFilled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showNumber && rating > 0 && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;