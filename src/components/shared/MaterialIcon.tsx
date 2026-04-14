interface MaterialIconProps {
  name: string;
  size?: number;
  filled?: boolean;
  weight?: number;
  className?: string;
}

/**
 * Material Symbols Outlined icon component.
 * 
 * Usage:
 * <MaterialIcon name="search" size={20} />
 * <MaterialIcon name="settings" filled weight={500} />
 */
export function MaterialIcon({
  name,
  size = 20,
  filled = false,
  weight = 400,
  className = "",
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
