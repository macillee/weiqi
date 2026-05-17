type BoardPointProps = {
  cx: number;
  cy: number;
  cellSize: number;
  disabled: boolean;
  occupied: boolean;
  onClick?: () => void;
};

export default function BoardPoint({
  cx,
  cy,
  cellSize,
  disabled,
  occupied,
  onClick,
}: BoardPointProps) {
  if (disabled || occupied) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={cellSize * 0.45}
      fill="transparent"
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={`Board intersection at ${cx}, ${cy}`}
    />
  );
}
