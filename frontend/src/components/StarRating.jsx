import React, { useState } from 'react';

export const StarRating = ({ value = 0, onChange, interactive = false, size = 'md' }) => {
  const [hoverValue, setHoverValue] = useState(0);

  const stars = [1, 2, 3, 4, 5];
  const currentValue = hoverValue || value || 0;

  return (
    <div className={`star-rating-container size-${size} ${interactive ? 'interactive' : 'readonly'}`}>
      <div className="stars-wrapper">
        {stars.map((star) => {
          const isFilled = star <= currentValue;
          return (
            <span
              key={star}
              className={`star ${isFilled ? 'filled' : 'empty'}`}
              onClick={() => interactive && onChange && onChange(star)}
              onMouseEnter={() => interactive && setHoverValue(star)}
              onMouseLeave={() => interactive && setHoverValue(0)}
              title={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
            >
              ★
            </span>
          );
        })}
      </div>
      {!interactive && value > 0 && (
        <span className="rating-number">{Number(value).toFixed(1)}</span>
      )}
      {!interactive && (!value || value === 0) && (
        <span className="rating-number text-muted">No ratings</span>
      )}
    </div>
  );
};
