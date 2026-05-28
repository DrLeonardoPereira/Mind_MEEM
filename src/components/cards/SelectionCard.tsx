import React, { forwardRef, ButtonHTMLAttributes } from 'react';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Props for the SelectionCard component
 */
export interface SelectionCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /**
   * The label text to display on the card
   */
  label: string;

  /**
   * The value associated with this card
   */
  value: string | number;

  /**
   * Whether this card is currently selected
   */
  isSelected?: boolean;

  /**
   * Callback when selection state changes
   */
  onChange?: (value: string | number) => void;

  /**
   * Optional description or subtitle text
   */
  description?: string;

  /**
   * Optional icon element to display
   */
  icon?: React.ReactNode;

  /**
   * Icon position relative to text
   * @default 'top'
   */
  iconPosition?: 'top' | 'left' | 'right';

  /**
   * Size variant for different card sizes
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Custom className to merge
   */
  className?: string;

  /**
   * Accessibility label for screen readers
   */
  ariaLabel?: string;

  /**
   * Custom background color for unselected state
   * @default 'white'
   */
  unselectedBgColor?: string;

  /**
   * Enable outline style (border only, no background fill)
   * @default false
   */
  outlineMode?: boolean;
}

// ============================================================================
// Size Configuration (Gerontological Design)
// ============================================================================

const SIZE_CONFIG = {
  small: {
    minHeight: 'min-h-14', // 56px
    padding: 'px-4 py-3',
    labelSize: 'text-sm',
    descriptionSize: 'text-xs',
    iconSize: 'w-5 h-5',
  },
  medium: {
    minHeight: 'min-h-[70px]', // 70px (minimum requirement)
    padding: 'px-6 py-4',
    labelSize: 'text-base',
    descriptionSize: 'text-sm',
    iconSize: 'w-6 h-6',
  },
  large: {
    minHeight: 'min-h-20', // 80px
    padding: 'px-8 py-5',
    labelSize: 'text-lg',
    descriptionSize: 'text-base',
    iconSize: 'w-8 h-8',
  },
};

// ============================================================================
// Color Schemes (WCAG AAA Compliant - 7:1+ Contrast Ratio)
// ============================================================================

/**
 * Unselected state: Clear, neutral appearance
 * High contrast dark text on light background
 */
const UNSELECTED_STYLES = {
  base: 'bg-white text-gray-900 border-gray-300',
  hover: 'hover:bg-gray-50 hover:border-gray-400',
  focus: 'focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2',
};

/**
 * Selected state: Strong visual feedback with green theme
 * - Soft green background for positive reinforcement
 * - Dark green border for clear selection indication
 * - High-contrast text for readability
 */
const SELECTED_STYLES = {
  base: 'bg-green-100 text-gray-900 border-green-700',
  hover: 'hover:bg-green-200 hover:border-green-800',
  focus: 'focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2',
};

/**
 * Outline mode styling
 */
const OUTLINE_UNSELECTED = {
  base: 'bg-transparent text-gray-900 border-gray-400',
  hover: 'hover:bg-gray-50 hover:border-gray-500',
};

const OUTLINE_SELECTED = {
  base: 'bg-green-50 text-gray-900 border-green-700',
  hover: 'hover:bg-green-100 hover:border-green-800',
};

// ============================================================================
// SelectionCard Component
// ============================================================================

/**
 * SelectionCard component for multiple choice selections
 *
 * Features:
 * - Minimum height of 70px for easy clicking (gerontological design)
 * - Thick 4px border for clear visual definition
 * - Selected state with soft green background and dark green border
 * - High contrast text (WCAG AAA compliant)
 * - Immediate visual feedback on selection
 * - Supports optional icon and description
 * - Fully accessible with ARIA attributes
 * - Responsive and touch-friendly
 * - Yellow focus ring for keyboard navigation
 *
 * @example
 * ```tsx
 * <SelectionCard
 *   label="Bachelor's Degree"
 *   value="bachelors"
 *   isSelected={selectedEducation === 'bachelors'}
 *   onChange={(value) => setSelectedEducation(value)}
 * />
 *
 * <SelectionCard
 *   label="Elementary School"
 *   value="elementary"
 *   description="Grades 1-6"
 *   icon={<BookIcon />}
 *   isSelected={true}
 *   size="large"
 * />
 * ```
 */
export const SelectionCard = forwardRef<HTMLButtonElement, SelectionCardProps>(
  (
    {
      label,
      value,
      isSelected = false,
      onChange,
      description,
      icon,
      iconPosition = 'top',
      size = 'medium',
      className = '',
      ariaLabel,
      unselectedBgColor = 'white',
      outlineMode = false,
      disabled = false,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    // ====================================================================
    // Event Handlers
    // ====================================================================

    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(value);
      }
    };

    // ====================================================================
    // Class Construction
    // ====================================================================

    const sizeConfig = SIZE_CONFIG[size];

    // Select appropriate style based on selected state
    const selectedStyles = isSelected
      ? outlineMode
        ? OUTLINE_SELECTED
        : SELECTED_STYLES
      : outlineMode
        ? OUTLINE_UNSELECTED
        : UNSELECTED_STYLES;

    let cardClasses = [
      // Base structure
      'relative w-full',
      'flex items-stretch justify-center',
      'rounded-lg',

      // Border: Thick 4px for clear visual definition
      'border-4',

      // Size configuration
      sizeConfig.minHeight,
      sizeConfig.padding,

      // Background and text colors (WCAG AAA compliant)
      selectedStyles.base,
      selectedStyles.hover,

      // Focus ring for keyboard navigation (high-visibility yellow)
      selectedStyles.focus,

      // Transitions for smooth state changes
      'transition-all duration-200 ease-out',

      // Active state feedback (scale and shadow)
      !disabled && 'active:scale-98 active:shadow-inner',

      // Hover shadow for depth perception
      !disabled && 'hover:shadow-md',

      // Base shadow
      'shadow-sm',

      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed',
      !disabled && 'cursor-pointer',

      // Focus outline for keyboard navigation
      'focus:outline-none focus-visible:outline-none',

      // Prevent selection of text on multi-click
      'select-none',
    ]
      .filter(Boolean)
      .join(' ');

    // Merge custom className
    if (className) {
      cardClasses = `${cardClasses} ${className}`;
    }

    // ====================================================================
    // Layout Configuration Based on Icon Position
    // ====================================================================

    const containerFlexClass = {
      top: 'flex-col items-center gap-3',
      left: 'flex-row items-center gap-4',
      right: 'flex-row-reverse items-center gap-4',
    }[iconPosition];

    const contentFlexClass = {
      top: 'text-center',
      left: 'text-left flex-1',
      right: 'text-right flex-1',
    }[iconPosition];

    // ====================================================================
    // Render
    // ====================================================================

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cardClasses}
        onClick={handleClick}
        aria-label={ariaLabel || label}
        aria-pressed={isSelected}
        role="option"
        aria-selected={isSelected}
        {...rest}
      >
        <div className={`flex ${containerFlexClass}`}>
          {/* Icon */}
          {icon && (
            <span
              className={`flex items-center justify-center flex-shrink-0 ${sizeConfig.iconSize}`}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}

          {/* Text Content */}
          <div className={contentFlexClass}>
            {/* Label */}
            <div
              className={`font-semibold ${sizeConfig.labelSize} leading-tight`}
            >
              {label}
            </div>

            {/* Description */}
            {description && (
              <div
                className={`text-gray-600 ${sizeConfig.descriptionSize} leading-snug mt-1`}
              >
                {description}
              </div>
            )}
          </div>

          {/* Selection Indicator (optional checkmark) */}
          {isSelected && (
            <span
              className="flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <svg
                className={`${sizeConfig.iconSize} text-green-700`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          )}
        </div>
      </button>
    );
  },
);

SelectionCard.displayName = 'SelectionCard';

export default SelectionCard;
