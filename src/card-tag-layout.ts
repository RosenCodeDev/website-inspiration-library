type TagRow = {
  indices: number[];
  width: number;
};

const permutations = (values: number[]): number[][] => {
  if (values.length <= 1) return [values];

  return values.flatMap((value, index) => (
    permutations(values.filter((_, candidateIndex) => candidateIndex !== index))
      .map((tail) => [value, ...tail])
  ));
};

const arrangeRows = (
  order: number[],
  widths: number[],
  availableWidth: number,
  gap: number,
): TagRow[] => {
  const rows: TagRow[] = [];

  for (const index of order) {
    const tagWidth = widths[index];
    const row = rows.at(-1);
    if (!row || row.width + gap + tagWidth > availableWidth + 0.5) {
      rows.push({ indices: [index], width: tagWidth });
    } else {
      row.indices.push(index);
      row.width += gap + tagWidth;
    }
  }

  return rows;
};

const compareNumbers = (left: number, right: number) => (
  Math.abs(left - right) < 0.5 ? 0 : left - right
);

const compareLayouts = (
  left: { order: number[]; rows: TagRow[] },
  right: { order: number[]; rows: TagRow[] },
  availableWidth: number,
) => {
  if (left.rows.length !== right.rows.length) return left.rows.length - right.rows.length;

  const leftPairedRows = left.rows.filter((row) => row.indices.length >= 2).length;
  const rightPairedRows = right.rows.filter((row) => row.indices.length >= 2).length;
  if (leftPairedRows !== rightPairedRows) return rightPairedRows - leftPairedRows;

  for (let index = 0; index < left.rows.length; index += 1) {
    const countDifference = right.rows[index].indices.length - left.rows[index].indices.length;
    if (countDifference !== 0) return countDifference;
  }

  for (let index = 0; index < left.rows.length; index += 1) {
    const unusedDifference = compareNumbers(
      availableWidth - left.rows[index].width,
      availableWidth - right.rows[index].width,
    );
    if (unusedDifference !== 0) return unusedDifference;
  }

  for (let index = 0; index < left.order.length; index += 1) {
    if (left.order[index] !== right.order[index]) return left.order[index] - right.order[index];
  }

  return 0;
};

export const optimizeCardTagOrder = (
  widths: number[],
  availableWidth: number,
  gap = 6,
): number[] => {
  if (widths.length < 2 || availableWidth <= 0) return widths.map((_, index) => index);

  const candidates = permutations(widths.map((_, index) => index)).map((order) => ({
    order,
    rows: arrangeRows(order, widths, availableWidth, gap),
  }));

  candidates.sort((left, right) => compareLayouts(left, right, availableWidth));
  return candidates[0].order;
};
