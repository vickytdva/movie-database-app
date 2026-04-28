function calculateAverageRating(ratings) {
  if (ratings.length === 0) {
    return 0;
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);
  return total / ratings.length;
}

test("calculates average rating correctly", () => {
  expect(calculateAverageRating([8, 9, 10])).toBe(9);
});

test("returns 0 when there are no ratings", () => {
  expect(calculateAverageRating([])).toBe(0);
});

test("calculates decimal average rating", () => {
  expect(calculateAverageRating([7, 8])).toBe(7.5);
});